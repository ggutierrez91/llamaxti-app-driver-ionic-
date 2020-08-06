import { Component, OnInit, OnDestroy, ViewChild, ElementRef, OnChanges } from '@angular/core';
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
import { AlertController, NavController } from '@ionic/angular';
import { IOffer } from '../../interfaces/offer.interface';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { retry } from 'rxjs/operators';
import { Insomnia } from '@ionic-native/insomnia/ngx';

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
  socktJournalbc: Subscription;
  socketServicesSbc: Subscription;
  socketOfferSbc: Subscription;
  cancelSbc: Subscription;

  map: google.maps.Map;
  marker: google.maps.Marker;

  codeJournal = 'DIURN';

  // dataServices: IServices[] = [];
  totalServices = 0;

  totalServicesZone = 0;
  totalDriverZone = 0;

  infoWindowPolygon: google.maps.InfoWindow;
  arrPolygons: google.maps.Polygon[] = [];

  lat = -12.054825;
  lng = -77.040627;

  demandColors = ['#0091F2', '#209FF4', '#40ADF5', '#60BAF7', '#80C8F8', '#9FD6FA'];

  // tslint:disable-next-line: max-line-length
  constructor( private io: SocketService,  private geo: Geolocation,  private taxiSvc: TaxiService, public st: StorageService, private router: Router, private vehicleSvc: VehicleService, private alertCtrl: AlertController, private navCtrl: NavController, private ui: UiUtilitiesService, private zombie: Insomnia ) { }

  ngOnInit() {

    this.zombie.keepAwake().then(
      (success) => { console.log('Teléfono en estado zombie :D', success); },
      (e) => { console.log('Error al prevenir bloqueo de pantalla', e); }
    );

    this.onLoadMap();

    this.onListenNewService();
    this.st.onLoadToken().then( () => {
      this.onLoadJournal();
      // this.onTotalServices();
      
      this.st.onLoadVehicle().then( () => {
        console.log(this.st.dataVehicle);
        if (this.st.pkVehicle === 0) {
          this.onGetVehicleUsing();
        }
      });
      this.onListenOfferClient();
      this.onListenJournal();
      this.onListenCancelService();
    });


    this.infoWindowPolygon = new google.maps.InfoWindow();

  }

  onListenOfferClient() {
    this.socketOfferSbc = this.io.onListen( 'newOffer-service-client' ).subscribe( async (res: any) => {

      console.log('oferta del cliente', res);
      if (res.accepted) {
        const offer: IOffer = res.res.dataOffer;
        const alertService = await this.alertCtrl.create({
          header: 'Mensaje al usuario',
          subHeader: 'Iniciando servicio de taxi',
          message: `${ offer.nameComplete }, ha aceptado tu oferta, por favor sirvace a pasar por su pasajero en: ${ offer.streetOrigin }`,
          mode: 'ios',
          buttons: [{
            text: 'Ok',
            cssClass: 'text-info',
            handler: async () => {
              await this.ui.onShowLoading('Espere....');

              await this.st.onSetItem('runDestination', false, false);
              await this.st.onSetItem('finishDestination', false, false);
              await this.st.onSetItem('current-service', offer, true);
              await this.st.onSetItem('current-page', '/service-run', false);
              await this.st.onSetItem('occupied-driver', true, false);

              this.io. onEmit('occupied-driver', { occupied: true }, (resOccupied) => {
                console.log('Cambiando estado conductor', resOccupied);
              });
              this.navCtrl.navigateRoot('/service-run', {animated: true}).then( async () => {
                await this.ui.onHideLoading();
              });

            }
          }]
        });
        await alertService.present();
        // el cliente acepto la oferta y comienza el servicio de taxi
      } else {
        // el cliente hizo una contra oferta
         // this.dataServices.unshift(...res.dataOffer);
         this.onTotalServices();
       }
    });
  }

  onListenCancelService() {
    this.cancelSbc = this.io.onListen('client-cancel-service').subscribe( (res: any) => {

      if (this.arrPolygons.length > 0) {
        console.log('eliminando poligonos');
        this.arrPolygons.forEach( (polygon)  => {
          polygon.setMap(null);
        });
        this.arrPolygons = [];
      }
      this.onTotalServices();
      this.onGetDemand();
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

    this.geoSbc = this.geo.watchPosition( ).pipe( retry(3) ).subscribe(
      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const latlng = new google.maps.LatLng( lat, lng );
        this.marker.setPosition( latlng );
        this.map.setCenter( latlng );

        this.io.onEmit('current-position-driver', {lat, lng }, (resSocket: IResSocket) => {
          console.log('Emitiendo ubicación conductor', resSocket.message);
          // this.onTotalServices();
          // this.onGetDemand();

        });

      },
      (e) => console.error('Surgio un errora l observar geo', e));

  }

  onListenJournal() {
    this.socktJournalbc = this.io.onListen('change-journal').subscribe( (res: any) => {
      const styleMap: any = res.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
      this.map.setOptions({
        styles: styleMap
      });
      this.st.onSetItem('codeJournal', res.codeJournal, false);
    });
  }

  onLoadJournal() {

    this.journalSbc = this.taxiSvc.onGetJournal().subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.codeJournal = res.data.codeJournal;
      this.st.onSetItem('codeJournal', res.data.codeJournal, false);
      const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;

      this.map.setOptions({
        styles: styleMap
      });
    });

  }

  onGetPosition() {
    this.geo.getCurrentPosition().then( (geo) => {

      const lat = geo.coords.latitude;
      const lng = geo.coords.longitude;

      setTimeout( () => {
        this.map.setCenter( new google.maps.LatLng( lat, lng ) );
        this.map.setZoom(14.5);
  
        this.marker.setMap( this.map );
        this.marker.setPosition(new google.maps.LatLng( lat, lng ));
      }, 2500 );

      this.io.onEmit('current-position-driver', {lat, lng }, (resSocket: IResSocket) => {
        console.log('Emitiendo ubicación conductor', resSocket.message);
        this.onTotalServices();
        this.onGetDemand();

      });

      this.onEmitGeo();

    });
  }

  onLoadMap() {
    const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 4.5,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap
    };

    this.map = new google.maps.Map( this.mapDriver.nativeElement, optMap );

    this.marker = new google.maps.Marker({
      draggable: true
    });

    this.onGetPosition();

  }

  onRedirectServices() {
    this.router.navigateByUrl('/services-list');
  }

  onGetVehicleUsing() {

    this.usingSbc = this.vehicleSvc.onGetUsing( this.st.pkDriver ).pipe( retry(2) ).subscribe( async ( res ) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      console.log('using data', res.data);
      if ( !res.data ) {
        // console.log('mostrando alerta');
        return this.onShowAlertUsing();
      }

      this.st.pkVehicle = res.data.pkVehicle;
      this.st.fkCategory = res.data.pkCategory;
      this.st.category = res.data.aliasCategory;
      this.st.codeCategory = res.data.codeCategory;
      this.st.brand = res.data.nameBrand;
      this.st.nameModel = res.data.nameModel;
      this.st.numberPlate = res.data.numberPlate;
      this.st.year = res.data.year;
      this.st.color = res.data.color;
      this.st.dataVehicle = res.data;

      await this.st.onSetItem('dataVehicle', res.data, true);

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
          strokeOpacity: 0.7,
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
        this.arrPolygons.push( demandPolygon );

        if (indexColor <= 5) {
          indexColor++;
        }

      });

      // console.log( 'poligonos', res );
    });
  }

  onListenNewService() {
    this.socketServicesSbc = this.io.onListen('new-service').subscribe( (resSocket: any) => {
      // recibimos la data del nuevo servicio
      this.arrPolygons.forEach( (polygon)  => {
        polygon.setMap(null);
      });
      this.arrPolygons = [];
      this.onTotalServices();
      this.onGetDemand();
      // this.onGetServices(1);
    });
  }

  ngOnDestroy() {
    console.log('destruyendo home');
    this.geoSbc.unsubscribe();
    this.journalSbc.unsubscribe();
    if (this.serviceSbc) {
      this.serviceSbc.unsubscribe();
    }
    if (this.demandSbc) {
      this.demandSbc.unsubscribe();
    }
    if (this.socketOfferSbc) {
      this.socketOfferSbc.unsubscribe();
    }
    this.socktJournalbc.unsubscribe();
  }

}
