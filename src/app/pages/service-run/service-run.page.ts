import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AlertController, NavController, ModalController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { IServices, IServiceAccepted } from '../../interfaces/services.interface';
import { TaxiService } from '../../services/taxi.service';
import { PushService } from '../../services/push.service';
import { ModalCalificationPage } from '../modal-calification/modal-calification.page';
import { PushModel } from '../../models/push.model';

@Component({
  selector: 'app-service-run',
  templateUrl: './service-run.page.html',
  styleUrls: ['./service-run.page.scss'],
})
export class ServiceRunPage implements OnInit, OnDestroy {

  @ViewChild('mapService', {static: true}) mapService: ElementRef;
  @ViewChild('infoClient', {static: true}) infoClient: ElementRef;

  map: google.maps.Map;
  markerClient: google.maps.Marker;
  markerDriver: google.maps.Marker;
  directionService: google.maps.DirectionsService;
  directionRender: google.maps.DirectionsRenderer;
  dataService: IServices = {
    streetOrigin: ''
  };
  dataServiceInfo: IServiceAccepted = {
    nameClient: '',
    documentClient: '',
    phoneClient: '',
  };
  distance = 0;
  minutes = 0;
  distanceText = '';
  minutesText = '';
  infoServiceSbc: Subscription;
  osSbc: Subscription;
  geoSbc: Subscription;
  lat = 0;
  lng = 0;
  runOrigin = true;
  finishOrigin = false;
  runDestination = false;
  finishDestination = false;
  loadRoute = false;
  loadCalification = false;

  bodyPush: PushModel;

  // tslint:disable-next-line: max-line-length
  constructor(private st: StorageService, private geo: Geolocation, private io: SocketService, private sh: SocialSharing, private ui: UiUtilitiesService, private alertCtrl: AlertController, private navCtrl: NavController, private serviceSvc: TaxiService, private os: PushService, private modalCtrl: ModalController) { }

  ngOnInit() {

    this.bodyPush = new PushModel();

    this.directionService = new google.maps.DirectionsService();
    this.directionRender = new google.maps.DirectionsRenderer();
    this.markerDriver = new google.maps.Marker({
      position: new google.maps.LatLng( -12.054825, -77.040627 ),
      animation: google.maps.Animation.DROP,
      icon: '/assets/geo-driver.png'
    });

    this.onLoadMap();
    this.st.onLoadToken().then( () => {
      this.onLoadService();
    } ).catch(e => console.error('error al cargar token storage', e) );
    this.st.onGetItem('codeJournal', false).then( (value) => {

      const styleMap: any = value === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
      this.map.setOptions({
        styles: styleMap
      });

    }).catch( (e) => console.error('Error al extraer codeJournal de storage', e) );
  }

  async onLoadService() {
    await this.ui.onShowLoading('Cargando información...');
    this.dataService = await this.st.onGetItem('current-service', true);

    if (!this.dataService) {
      await this.ui.onHideLoading();
      const alertFound = await this.alertCtrl.create({
        header: 'Mensaje al usuario',
        message: 'No tiene un servicio en curso, cree uno nuevo',
        mode: 'ios',
        buttons: [{
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            this.navCtrl.navigateRoot('/home', {animated: true});
          }
        }]
      });

      await alertFound.present();
      return;
    }

    this.markerClient = new google.maps.Marker({
      position: new google.maps.LatLng( this.dataService.latOrigin, this.dataService.lngOrigin ),
      animation: google.maps.Animation.DROP,
      map: this.map
    });

    this.infoServiceSbc = this.serviceSvc.onServiceInfo( this.dataService.pkService ).subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }
      this.loadCalification = await this.st.onGetItem('loadCalification', false);
      this.loadRoute = await this.st.onGetItem('loadRoute', false);
      this.runOrigin = await this.st.onGetItem('runOrigin', false);
      this.finishOrigin = await this.st.onGetItem('finishOrigin', false);
      this.runDestination = await this.st.onGetItem('runDestination', false);
      this.finishDestination = await this.st.onGetItem('finishDestination', false);
      await this.ui.onHideLoading();
      if (this.loadRoute) {
        this.onLoadRoute();
      }

      const infowindow = new google.maps.InfoWindow({
        content: this.infoClient.nativeElement
      });

      infowindow.open(this.map, this.markerClient);

      this.markerClient.addListener('click', () => {
        infowindow.open(this.map, this.markerClient);
      });

      this.dataServiceInfo = res.data;
      if (!this.loadCalification) {
        this.onListenGeo();
      } else {
        this.onShowModalCalification();
      }
    });

    // this.map.setZoom(14.5);
  }

  onLoadMap() {

    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 14.5,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map( this.mapService.nativeElement, optMap );

  }

  onListenGeo() {
    this.geoSbc = this.geo.watchPosition().subscribe( (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.lat = lat;
      this.lng = lng;
      // this.onLoadRoute();
      this.onLoadDistance();
      const latlng = new google.maps.LatLng( lat, lng );

      this.markerDriver.setPosition( latlng );
      this.markerDriver.setMap( this.map );
      // this.map.setZoom(14.5);
      this.map.setCenter(latlng);

    });
  }

  onLoadRoute() {
    const pointA = new google.maps.LatLng( this.lat, this.lng );
    const pointB = new google.maps.LatLng( this.dataServiceInfo.latDestination, this.dataServiceInfo.lngDestination );

    this.directionService.route({ origin: pointA,
                                  destination: pointB,
                                  travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
        if (status === 'OK') {
          this.directionRender.setDirections(res);
          if (!this.directionRender.getMap()) {
            this.directionRender.setMap( this.map );
          }
        }
    });
  }

  onLoadDistance() {
    const pointA = new google.maps.LatLng( this.lat, this.lng );
    let pointB = new google.maps.LatLng( this.dataService.latOrigin, this.dataService.lngOrigin );
    if (this.runDestination) {
      pointB = new google.maps.LatLng( this.dataServiceInfo.latDestination, this.dataServiceInfo.lngDestination );
    }
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [ pointA ],
      destinations: [pointB],
      travelMode: google.maps.TravelMode.DRIVING
    }, (distance) => {

      this.distanceText = distance.rows[0].elements[0].distance.text;
      this.minutesText = distance.rows[0].elements[0].duration.text;
      this.distance = distance.rows[0].elements[0].distance.value;
      this.minutes = distance.rows[0].elements[0].duration.value;

      // notificar mediante socket y push acercamiento del conductor al cliente
      // this.runDetination = false;
      console.log(`run origin ${ this.runOrigin }`, this.distance);

      if (this.runOrigin) {
        if ((this.distance <= 300 && this.distance >= 280) || (this.distance <= 100 && this.distance >= 90 ) ) {

          this.bodyPush.message = `Conductor a ${ this.distanceText } - ${ this.minutesText } de tu ubicación`;

          this.bodyPush.title = 'Llamataxi-app';
          this.bodyPush.osId = [ this.dataServiceInfo.osIdClient ];

          this.os.onSendPushUser( this.bodyPush );
        }
      }

      if ( this.distance <= 50 && this.runOrigin && !this.finishOrigin ) {
          this.onFinishRunOrigin();
      } else if ( this.distance <= 50 && this.runDestination && !this.finishDestination ) {
          this.onFinishDestination();
      }

      this.onEmitGeoDriverToClient();

    });
  }

  onFinishRunOrigin() {
    this.runOrigin = false;
    this.finishOrigin = true;
    this.runDestination = true;
    this.st.onSetItem('runOrigin', false, false);
    this.st.onSetItem('finishOrigin', true, false);
    this.st.onSetItem('runDestination', true, false);
    if (!this.loadRoute) {
      this.loadRoute = true;
      this.st.onSetItem('loadRoute', true, false);
      this.onLoadRoute();
    }
    this.onEmitTravel();
  }

  onFinishDestination() {
    this.runDestination = false;
    this.finishDestination = true;
    this.st.onSetItem('runDestination', false, false);
    this.st.onSetItem('finishDestination', true, false);

    if (!this.loadCalification) {
      this.loadCalification = true;
      this.st.onSetItem('loadCalification', true, false);

      // abrir modal de calificación y desuscribir ubicación del conductor
      if (this.geoSbc) {
        this.geoSbc.unsubscribe();
      }
      // abrir modal
      this.onShowModalCalification();

    }

    this.onEmitTravel();
  }

  async onShowModalCalification() {
    const modalCalif = await this.modalCtrl.create({
      component: ModalCalificationPage,
      mode: 'md',
      animated: true,
      componentProps: {
        pkService: this.dataServiceInfo.pkService,
        pkClient: this.dataService.fkClient
      }
    });

    await modalCalif.present();

    modalCalif.onDidDismiss().then( (res) => {

      this.navCtrl.navigateRoot('/home');

    });
  }

  onEmitTravel() {
    const payload = {
      pkClient: this.dataService.fkClient,
      pkService: this.dataService.pkService,
      runOrigin: this.runOrigin,
      finishOrigin: this.finishOrigin,
      runDestination: this.runDestination,
      finishDestination: this.finishDestination,
      loadRoute: this.loadRoute,
      loadCalification: this.loadCalification
    };

    this.io.onEmit('status-travel-driver', payload, (res) => {
      console.log('notificando llegada del conductor');
    });
  }

  onEmitGeoDriverToClient( ) {

    const payload = {
      lat: this.lat,
      lng: this.lng,
      pkClient: this.dataService.fkClient,
      distanceText: this.distanceText,
      minutesText: this.minutesText,
      distance: this.distance,
      minutes: this.minutes,
    };

    this.io.onEmit('current-position-driver-service', payload, (resSocket) => {
      console.log('Emitiendo ubicación del conductor', resSocket);
    });

    // tslint:disable-next-line: max-line-length
    if ( (this.distance <= 100 && this.distance >= 90)  || (this.distance <= 50 && this.distance >= 40 ) || (this.distance <= 25 && this.distance >= 10 )) {

      if (this.osSbc) {
        this.osSbc.unsubscribe();
      }

      this.bodyPush.message = `${ this.dataServiceInfo.nameDriver }, a ${ this.distanceText } ( ${ this.minutesText } ) de tu ubicación`;

      this.bodyPush.title = 'LlamataxiApp - Conductor aproximandose';
      this.bodyPush.osId = [ this.dataServiceInfo.osIdClient ];

      this.osSbc = this.os.onSendPushUser( this.bodyPush ).subscribe( (resOs: any)  => {
          console.log('notificación enviada', resOs);
      });
    }

  }

  onSharedGeo() {
    this.sh.share( 'Llamataxi app', `Desde lorem ipsum hasta lorem ipsum two conductor nameComplete`, '', `http://www.google.com/maps/place/${ this.lat },${ this.lng }` ).then( (resShared) => {
      console.log('Se compartió ubicación exitosamente', resShared);
    }).catch( e => console.error( 'Error al compartir ubicación', e ) );
  }

  ngOnDestroy() {
    if (this.geoSbc) {
      this.geoSbc.unsubscribe();
    }
    this.infoServiceSbc.unsubscribe();
    if (this.osSbc) {
      this.osSbc.unsubscribe();
    }
  }

}
