import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { IResSocket } from '../../interfaces/response-socket.interface';
import { TaxiService } from '../../services/taxi.service';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { GeolocationOptions, Geolocation } from '@ionic-native/geolocation/ngx';
import { IServices, IPolygons } from '../../interfaces/services.interface';
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
  @ViewChild('infoPolygon', {static: true}) infoPolygon: ElementRef;
  
  geoSbc: Subscription;
  journalSbc: Subscription;
  serviceSbc: Subscription;
  usingSbc: Subscription;
  demandSbc: Subscription;
  socketServicesSbc: Subscription;

  map: google.maps.Map;
  marker: google.maps.Marker;

  codeJournal = 'DIURN';

  dataServices: IServices[] = [];
  totalServices = 0;

  totalServicesZone = 0;
  totalDriverZone = 0;

  infoWindowPolygon: google.maps.InfoWindow;

  lat = -12.054825;
  lng = -77.040627;

  demandColors = ['#FE685F', '#FE8F5F', '#FED75F', '#C2FE5F', '#5FFE60'];

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

    this.infoWindowPolygon = new google.maps.InfoWindow();

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
        // console.log('cambio mi ubicación');


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

      this.io.onEmit('current-position-driver',
                      {lat: geo.coords.latitude, lng: geo.coords.longitude },
                      (resSocket: IResSocket) => {
        console.log('Emitiendo ubicación conductor', resSocket.message);

        setTimeout(() => {
          this.onGetDemand();
        }, 3000);

      });

    });
  }

  onLoadMap() {

    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 4.5,
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
      this.st.codeCategory = res.data.codeCategory;
      this.st.brand = res.data.nameBrand;
      this.st.numberPlate = res.data.numberPlate;

      await this.st.onSetItem('pkVehicle', res.data.pkVehicle);
      await this.st.onSetItem('fkCategory', res.data.pkCategory);
      await this.st.onSetItem('category', res.data.aliasCategory);
      await this.st.onSetItem('codeCategory', res.data.codeCategory);
      await this.st.onSetItem('brand', res.data.nameBrand);
      await this.st.onSetItem('numberPlate', res.data.numberPlate);

      this.io.onEmit('change-category',
                      { pkCategory: res.data.pkCategory, codeCategory: res.data.codeCategory },
                      ( resSocket: IResSocket ) => {
        console.log('Notificando a backend =>', resSocket);
      });

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

  onGetDemand() {
    this.demandSbc = this.taxiSvc.onGetDemand().subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }
      const dataP: IPolygons[] = res.data;

      let indexColor = 0;

      dataP.forEach( dataPolygon => {
        // const arrayCoords: any[] = dataPolygon.polygon;
        const polygonCoords: google.maps.LatLng[] = [];
        dataPolygon.polygon.forEach( (coords) => {
          polygonCoords.push( new google.maps.LatLng( coords[0], coords[1] ) );
        });

        const demandPolygon = new google.maps.Polygon({
          paths: polygonCoords,
          strokeColor: this.demandColors[indexColor],
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: this.demandColors[indexColor],
          fillOpacity: 0.35
        });

        demandPolygon.setMap( this.map );

        // Add a listener for the click event.
        demandPolygon.addListener('click', (data: any) => {
          this.infoWindowPolygon.setContent(this.infoPolygon.nativeElement);
          this.infoWindowPolygon.setPosition( new google.maps.LatLng( dataPolygon.center[0], dataPolygon.center[1] ) );

          this.totalServicesZone = dataPolygon.total || 0;
          this.totalDriverZone = dataPolygon.totalDrivers || 0;
  
          this.infoWindowPolygon.open(this.map);
        });

        if (indexColor <= 4) {
          indexColor++;
        }

      });

      console.log( 'poligonos', res );
    });
  }

  onListenNewService() {
    this.socketServicesSbc = this.io.onListen('new-service').subscribe( (resSocket: any) => {
      // recibimos la data del nuevo servicio
      this.onTotalServices();
      // this.onGetServices(1);
    });
  }

  ngOnDestroy() {
    this.geoSbc.unsubscribe();
    this.journalSbc.unsubscribe();
    this.serviceSbc.unsubscribe();
    this.demandSbc.unsubscribe();
  }

}
