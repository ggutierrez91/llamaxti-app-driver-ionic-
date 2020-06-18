import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { IResSocket } from '../../interfaces/response-socket.interface';
import { TaxiService } from '../../services/taxi.service';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { GeolocationOptions, Geolocation } from '@ionic-native/geolocation/ngx';
import { IServices } from '../../interfaces/services.interface';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('mapDriver', {static: true}) mapDriver: ElementRef;

  geoSbc: Subscription;
  journalSbc: Subscription;
  serviceSbc: Subscription;
  usingSbc: Subscription;

  map: google.maps.Map;
  marker: google.maps.Marker;

  codeJournal = 'DIURN';

  dataServices: IServices[] = [];
  totalServices = 0;

  lat = -12.054825;
  lng = -77.040627;

  // tslint:disable-next-line: max-line-length
  constructor( private io: SocketService,  private geo: Geolocation,  private taxiSvc: TaxiService, public st: StorageService, private router: Router, private vehicleSvc: VehicleService, private alertCtrl: AlertController ) { }

  ngOnInit() {

    this.onLoadMap();
    this.onEmitGeo();
    this.onGetPosition();

    this.st.onLoadToken().then( () => {
      this.onLoadJournal();
      this.onTotalServices();
      this.onGetVehicleUsing();
    });

  }

  onTotalServices() {
    this.serviceSbc = this.taxiSvc.onGetTotalServices().subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.totalServices = res.total;
    });
  }

  onEmitGeo() {

    const opt: GeolocationOptions = {
      timeout: 4000,
      maximumAge: 0
    };

    this.geoSbc = this.geo.watchPosition( opt ).subscribe(
      (position) => {

        // console.log(`${ this.lat } === ${ position.coords.latitude }`);
        // console.log(`${ this.lng } === ${ position.coords.longitude }`);

        if ( this.lat === position.coords.latitude && this.lng === position.coords.longitude ) {
          return false;
        }

        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        const latlng = new google.maps.LatLng( position.coords.latitude, position.coords.longitude );
        this.marker.setPosition( latlng );

        this.io.onEmit('current-position-driver',
                      {lat: position.coords.latitude, lng: position.coords.longitude },
                      (resSocket: IResSocket) => {
          console.log('Emitiendo ubicación conductor', resSocket.message);
        });
        console.log('cambio mi ubicación');


      },
      (e) => console.error('Surgio un error', e));

  }

  onLoadJournal() {

    this.journalSbc = this.taxiSvc.onGetJournal().subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.codeJournal = res.data.codeJournal;
      const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;

      this.map.setOptions({
        styles: styleMap
      });
    });

  }

  onGetPosition() {
    this.geo.getCurrentPosition().then( (geo) => {

      this.map.setCenter( new google.maps.LatLng( geo.coords.latitude, geo.coords.longitude ) );
      this.map.setZoom(14.5);

      this.marker.setMap( this.map );
      this.marker.setPosition(new google.maps.LatLng( geo.coords.latitude, geo.coords.longitude ));

    });
  }

  onLoadMap() {

    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 7.5,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map( this.mapDriver.nativeElement, optMap );

    this.marker = new google.maps.Marker({
      draggable: true
    });
  }

  onRedirectServices() {
    this.router.navigateByUrl('/services-list');
  }

  onGetVehicleUsing() {

    this.usingSbc = this.vehicleSvc.onGetUsing().subscribe( async ( res ) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      console.log('using data', res.data);
      if ( !res.data ) {
        console.log('mostrando alerta');
        return this.onShowAlertUsing();
      }

      this.st.pkVehicle = res.data.pkVehicle;
      this.st.fkCategory = res.data.pkCategory;
      this.st.category = res.data.aliasCategory;
      this.st.brand = res.data.nameBrand;
      this.st.numberPlate = res.data.numberPlate;

      await this.st.onSetItem('pkVehicle', res.data.pkVehicle);
      await this.st.onSetItem('fkCategory', res.data.pkCategory);
      await this.st.onSetItem('category', res.data.aliasCategory);
      await this.st.onSetItem('brand', res.data.nameBrand);
      await this.st.onSetItem('numberPlate', res.data.numberPlate);

    });

  }

  async onShowAlertUsing() {
    const alertUsing = await this.alertCtrl.create({
      header: 'Mensaje al usuario',
      message: 'Por favor especificar el auto que usará en la jornada',
      mode: 'ios',
      buttons: [{
        text: 'Cerrar',
        role: 'close',
        cssClass: 'text-danger',
        handler: () => {}
      }, {
        text: 'Ir a vehículos',
        handler: async () => {
          await this.router.navigateByUrl('/vehicle');
        }
      }]
    });

    await alertUsing.present();
  }

  ngOnDestroy() {
    this.geoSbc.unsubscribe();
    this.journalSbc.unsubscribe();
    this.serviceSbc.unsubscribe();
  }

}
