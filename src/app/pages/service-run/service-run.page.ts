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
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';

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
    fkClient: 0,
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

  runDestination = false;
  finishDestination = false;

  bodyPush: PushModel;

  // tslint:disable-next-line: max-line-length
  constructor(  private st: StorageService,
                private geo: Geolocation,
                private io: SocketService,
                private sh: SocialSharing,
                private ui: UiUtilitiesService,
                private alertCtrl: AlertController,
                private navCtrl: NavController,
                private serviceSvc: TaxiService,
                private os: PushService,
                private modalCtrl: ModalController,
                private zombie: Insomnia,
                private launchNavigator: LaunchNavigator) { }

  ngOnInit() {

    this.zombie.keepAwake().then(
      (success) => { console.log('Teléfono en estado zombie :D', success); },
      (e) => { console.log('Error al prevenir bloqueo de pantalla', e); }
    );

    this.bodyPush = new PushModel();

    this.onLoadMap();

    this.st.onLoadToken().then( async() => {
      this.onLoadService();
      const cJournal = await this.st.onGetItem('codeJournal', false);
      const styleMap: any = cJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
      this.map.setOptions({
        styles: styleMap
      });
    } ).catch(e => console.error('error al cargar token storage', e) );

  }

  onLoadMap() {

    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 7.5,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map( this.mapService.nativeElement, optMap );

    this.directionService = new google.maps.DirectionsService();
    this.directionRender = new google.maps.DirectionsRenderer({map: this.map});

    this.onLoadGeo();

  }

  onLoadGeo() {

    this.geo.getCurrentPosition().then( (val) => {

      this.lat =  val.coords.latitude;
      this.lng =  val.coords.longitude;

      const latlng = new google.maps.LatLng( val.coords.latitude, val.coords.longitude );

      this.markerDriver = new google.maps.Marker({
        position: latlng,
        animation: google.maps.Animation.DROP,
        icon: '/assets/geo-driver.png',
        map: this.map
      });

      setTimeout(() => {
        this.map.setCenter(latlng);
        this.map.setZoom(14.6);
      }, 2500);

    });

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
            this.st.onSetItem('current-page', '/home', false);
            this.navCtrl.navigateRoot('/home', {animated: true});
          }
        }]
      });

      await alertFound.present();
      return;
    }

    this.infoServiceSbc = this.serviceSvc.onServiceInfo( this.dataService.pkService ).subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      // console.log(res.data);
      this.dataServiceInfo = res.data;
      this.runDestination = this.dataServiceInfo.runDestination;
      this.finishDestination = this.dataServiceInfo.finishDestination;

      this.lat = this.dataServiceInfo.latDriver;
      this.lng = this.dataServiceInfo.lngDriver;

      await this.ui.onHideLoading();

      this.onLoadRoute(); // mostarndo ruta

      const infowindow = new google.maps.InfoWindow({
        content: this.infoClient.nativeElement
      });

      this.onListenGeo();

    });

  }

  onRun() {

    this.runDestination = true;
    this.onLoadRoute();
    const payload = {
      runDestination: this.runDestination,
      finishDestination: this.finishDestination,
      pkClient: this.dataServiceInfo.fkClient,
      pkService: this.dataService.pkService
    };

    this.io.onEmit('status-travel-driver', payload, (ioRes: any) => {
      console.log('Emitiendo estado de servicio a cliente', ioRes);
    });
    this.onLaunchNav();

  }

  onLaunchNav() {

    const options: LaunchNavigatorOptions = {
      start: [this.dataServiceInfo.latOrigin, this.dataServiceInfo.lngOrigin],
      transportMode: this.launchNavigator.TRANSPORT_MODE.DRIVING,
      startName: this.dataServiceInfo.streetOrigin,
      destinationName: this.dataServiceInfo.streetDestination
      // app: 'USER_SELECT '
    };

    const lat = this.dataServiceInfo.latDestination;
    const lng = this.dataServiceInfo.lngDestination;

    this.launchNavigator.navigate( [lat, lng] , options)
      .then(
        (success) => console.log('Launched navigator', success),
        (error) => console.log('Error launching navigator', error)
      );
  }

  async onFinish() {

    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirmación',
      subHeader: 'Llamataxi-app',
      message: '¿Está seguro de dar por finalizado el servicio?',
      animated: true,
      mode: 'ios',
      buttons: [{
        text: 'No',
        cssClass: 'text-dark',
        role: 'Close',
        handler: () => {}
      }, {
        text: 'Aceptar',
        role: 'ok',
        cssClass: 'text-info',
        handler: () => {
          this.onShowModalCalification();
        }
      }]
    });

    await confirmAlert.present();
  }

  onListenGeo() {
    this.geoSbc = this.geo.watchPosition().subscribe( (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.lat = lat;
      this.lng = lng;
      this.onLoadDistance();
      const latlng = new google.maps.LatLng( lat, lng );

      this.markerDriver.setOptions( {position: latlng, icon: '/assets/geo-driver.png' } );
      this.map.setCenter( latlng );

    });
  }

  onLoadRoute() {
    const pointA = new google.maps.LatLng( this.lat, this.lng );
    let lat = this.dataServiceInfo.latOrigin;
    let lng = this.dataServiceInfo.lngOrigin;
    if (this.runDestination) {
      lat = this.dataServiceInfo.latDestination;
      lng = this.dataServiceInfo.lngDestination;
    }
    const pointB = new google.maps.LatLng( lat, lng );

    this.directionService.route({ origin: pointA,
                                  destination: pointB,
                                  travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
        if (status === 'OK') {
          this.directionRender.setDirections(res);
          // this.directionRender.setMap( this.map );
          // console.log('cargando ruta');
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

      if (!this.runDestination) {
        if ((this.distance <= 250 && this.distance >= 200) || (this.distance <= 100 && this.distance >= 70 ) ) {

          this.bodyPush.message = `Conductor a ${ this.distanceText } - ${ this.minutesText } de tu ubicación`;

          this.bodyPush.title = 'Llamataxi-app';
          this.bodyPush.osId = [ this.dataServiceInfo.osIdClient ];

          this.os.onSendPushUser( this.bodyPush );
        }
      }

      this.onEmitGeoDriverToClient();

    });
  }

  async onShowModalCalification() {

    await this.ui.onShowLoading('Espere...');

    this.runDestination = false;
    this.finishDestination = true;
    const payload = {
      runDestination: this.runDestination,
      finishDestination: this.finishDestination,
      pkClient: this.dataService.fkClient,
      pkService: this.dataService.pkService
    };
    this.io.onEmit('status-travel-driver', payload, (ioRes) => {
      console.log('Emitiendo estado de servicio a cliente', ioRes);
    });

    const modalCalif = await this.modalCtrl.create({
      component: ModalCalificationPage,
      mode: 'md',
      animated: true,
      componentProps: {
        pkService: this.dataServiceInfo.pkService,
        pkClient: this.dataService.fkClient,
        dataService: this.dataServiceInfo,
        token: this.st.token
      }
    });

    modalCalif.present().then( async () => {
      await this.ui.onHideLoading();
    });

    modalCalif.onDidDismiss().then( async (res) => {

      await this.st.onSetItem('current-page', '/home', false);
      await this.st.onSetItem('current-service', null, false);

      await this.st.onSetItem('occupied-driver', false, false);

      await this.st.onSetItem('runDestination', false, false);
      await this.st.onSetItem('finishDestination', false, false);

      this.io. onEmit('occupied-driver', { occupied: false }, (resOccupied) => {
        console.log('Cambiando estado conductor', resOccupied);
      });
      if (res.data.ok) {
        await this.ui.onHideLoading();
      }
      this.navCtrl.navigateRoot('/home');

    });
  }

  onEmitGeoDriverToClient( ) {

    const payload = {
      lat: this.lat,
      lng: this.lng,
      pkClient: this.dataServiceInfo.fkClient,
      distanceText: this.distanceText,
      minutesText: this.minutesText,
      distance: this.distance,
      minutes: this.minutes,
    };

    this.io.onEmit('current-position-driver-service', payload, (resSocket) => {
      console.log('Emitiendo ubicación del conductor al cliente =====', resSocket);
    });

  }

  onSharedGeo() {
    let msg = `Desde ${ this.dataServiceInfo.streetOrigin }, `;
    msg += `hasta ${ this.dataServiceInfo.streetDestination }.`;
    msg += `Conductor ${ this.dataServiceInfo.nameDriver }`;
    const url = `http://www.google.com/maps/place/${ this.lat },${ this.lng }`;

    this.sh.share( 'Llamataxi app', msg, '', url ).then( (resShared) => {
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
