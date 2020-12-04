import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AlertController, NavController, ModalController, MenuController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';
import { Subscription, Observable, interval } from 'rxjs';
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
import { IResSocketCoors, IResSocket } from '../../interfaces/response-socket.interface';
import { GeoService } from '../../services/geo.service';
import { retry, map, take } from 'rxjs/operators';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { formatNumber } from '@angular/common';
import { ModalChatPage } from '../modal-chat/modal-chat.page';
import { Howl } from 'howler';
import { AppUtilitiesService } from 'src/app/services/app-utilities.service';
import { promise } from 'protractor';

const URI_API = environment.URL_SERVER;
declare var window;

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
    color: '',
    nameClient: '',
    nameDriver: '',
    numberPlate: '',
    imgTaxiFrontal: 'xd.png',
    fkVehicle: 0,
    pkDriver: 0,
    nameModel: '',
    nameBrand: '',
    paymentType: 'CASH'
  };
  distance = 0;
  minutes = 0;
  distanceText = '';
  minutesText = '';
  infoServiceSbc: Subscription;
  osSbc: Subscription;
  geoSbc: Subscription;
  deleteSbc: Subscription;
  cancelRunSbc: Subscription;
  pushDistance: Subscription;
  intervalo: Subscription;
  chatSbc: Subscription;
  jdSbc: Subscription;

  showAlert = false;
  hideAlert = false;
  seconds = 3;
  loadingAlert = false;
  successAlert = false;
  dangerAlert = false;
  msgAlert = '';

  lat = 0;
  lng = 0;
  currentStreet = '';

  runOrigin = false;
  finishOrigin = false;
  runDestination = false;
  finishDestination = false;
  codeJournal = 'DIURN';
  bodyPush: PushModel;

  viewMore = false;
  showMoreCard = false;
  pathUser = URI_API + '/User/Img/Get/';
  loadingConfirm = false;
  loadingConfirmNav = false;
  loading = true;
  loadModalChat = false;
  newMessages = 0;
  // tslint:disable-next-line: max-line-length
  sendPush = 0;
  constructor(  public st: StorageService,
                private geo: GeoService,
                public io: SocketService,
                private sh: SocialSharing,
                private ui: UiUtilitiesService,
                private alertCtrl: AlertController,
                private navCtrl: NavController,
                private serviceSvc: TaxiService,
                private os: PushService,
                private modalCtrl: ModalController,
                private zombie: Insomnia,
                private launchNavigator: LaunchNavigator,
                private menuCtrl: MenuController,
                private apps: AppUtilitiesService ) { }

  ngOnInit() {

    this.menuCtrl.swipeGesture(false);

    this.zombie.keepAwake().then(
      (success) => { console.log('Teléfono en estado zombie :D', success); },
      (e) => { console.log('Error al prevenir bloqueo de pantalla', e); }
    );

    this.bodyPush = new PushModel();

    this.onLoadMap();
    this.apps.onLoadTokenTacker();
    this.st.onLoadToken().then( async () => {

      this.io.onEmit('occupied-driver', { occupied: true, pkUser: this.st.pkUser }, (resOccupied) => {
        console.log('Cambiando estado conductor', resOccupied);
      });

      window.tracker.backgroundGeolocation.start();

      this.onLoadMap();
      this.onLoadGeo();
      this.onLoadService();
      this.codeJournal = await this.st.onGetItem('codeJournal', false);
      const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
      this.map.setOptions({
        styles: styleMap
      });
      this.onListenNewMsgChat();
    } ).catch(e => console.error('error al cargar token storage', e) );

    this.onListenCancelRun();
  }

  onLoadMap() {
    const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;

    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 7.5,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap
    };

    this.map = new google.maps.Map( this.mapService.nativeElement, optMap );

    this.directionService = new google.maps.DirectionsService();
    this.directionRender = new google.maps.DirectionsRenderer({map: this.map});

  }

  onLoadGeo() {

    this.geo.onGetGeo().then( (val) => {

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

  onListenCancelRun() {

    this.cancelRunSbc = this.io.onListen('cancel-service-run-receptor')
    .pipe( retry() )
    .subscribe( async (res) => {
      await this.onResetStorage();
      // window.tracker.backgroundGeolocation.stop();
      this.navCtrl.navigateRoot('/home');
    });

  }

  async onLoadService() {
    this.loading = true;
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

    this.infoServiceSbc = this.serviceSvc.onServiceInfo( this.dataService.pkService )
    // .pipe( retry() )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataServiceInfo = res.data;
      this.st.pkService = this.dataServiceInfo.pkService;
      this.runOrigin = this.dataServiceInfo.runOrigin;
      this.finishOrigin = this.dataServiceInfo.finishOrigin;
      this.runDestination = this.dataServiceInfo.runDestination;
      this.finishDestination = this.dataServiceInfo.finishDestination;

      await this.st.onSetItem('pkClient', this.dataServiceInfo.fkClient);
      this.apps.pkClient = this.dataServiceInfo.fkClient;
      this.lat = this.dataServiceInfo.latDriver;
      this.lng = this.dataServiceInfo.lngDriver;

      await this.ui.onHideLoading();
      this.onStreet();
      this.onLoadRoute(); // mostarndo ruta

      this.loading = false;

      this.io.onEmit('change-play-geo', { value: true }, async (resIO: IResSocket) => {

        if (resIO.ok) {
          this.onListenGeo();
          window.tracker.backgroundGeolocation.start();
        }

      });

    });

  }

  onStreet() {
    this.geo.onGetStreet( this.lat, this.lng ).then( res => {

      const streetStr = `${res[0].thoroughfare} #${ res[0].subThoroughfare } - ${ res[0].locality }`;

      this.currentStreet = streetStr;
      // console.log('calle donde estoy', streetStr);

    }).catch( e => {
      throw new Error( e );
    });
  }

  async onRun() {
   if (this.runOrigin) {

      this.loadingConfirmNav = true;
      const navConfirm = await this.alertCtrl.create({
        header: 'Confirmación',
        message: '¿Está seguro de <b>iniciar navegación</b> hacia el punto de destino?; una vez iniciado no podrá cancelar el servicio',
        mode: 'ios',
        buttons: [{
          text: 'No',
          role: 'not',
          cssClass: 'text-dark',
          handler: () => {}
        }, {
          text: 'Iniciar',
          role: 'yes',
          cssClass: 'text-success',
          handler: async () => {
            await this.ui.onShowLoading( 'Espere...' );
            this.runOrigin = true;
            this.finishOrigin = true;
            this.runDestination = true;
            this.onLoadRoute();
            await this.onUpdateTotalJournal();
            this.onLaunchNav( );
          }
        }]
      });

      navConfirm.present().then( () => {
        this.loadingConfirmNav = false;
      }).catch( e => console.log('Error al abrir confirm nav', e) );

   } else {
     this.runOrigin = true;
     this.onLaunchNav();
   }

  }

  onLaunchNav( ) {

    const payload = {
      runOrigin: this.runOrigin,
      finishOrigin: this.finishOrigin,
      runDestination: this.runDestination,
      finishDestination: this.finishDestination,
      pkClient: this.dataServiceInfo.fkClient,
      pkService: this.dataService.pkService
    };

    this.io.onEmit('status-travel-driver', payload, (ioRes: any) => {
      console.log('Emitiendo estado de servicio a cliente', ioRes);
    });

    const destination = !this.runDestination ? this.dataServiceInfo.streetOrigin : this.dataServiceInfo.streetDestination;

    const lat = !this.runDestination ? this.dataServiceInfo.latOrigin : this.dataServiceInfo.latDestination;
    const lng = !this.runDestination ? this.dataServiceInfo.lngOrigin : this.dataServiceInfo.lngDestination;

    const latStart = !this.runDestination ? this.lat : this.dataServiceInfo.latOrigin;
    const lngStart = !this.runDestination ? this.lng : this.dataServiceInfo.lngOrigin;

    const options: LaunchNavigatorOptions = {
      start: [latStart, lngStart],
      transportMode: this.launchNavigator.TRANSPORT_MODE.DRIVING,
      startName: this.currentStreet,
      destinationName: destination
      // app: 'USER_SELECT '
    };

    this.launchNavigator.navigate( [lat, lng] , options)
      .then( async (success) => {
          await this.ui.onHideLoading();
          console.log('Launched navigator', success);
      }).catch((e) => {

        console.log('Error launching navigator', e);
      });
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
    this.geoSbc = this.geo.onListenGeo().pipe( retry() ).subscribe( (position: Geoposition) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const latlng = new google.maps.LatLng( lat, lng );

      this.markerDriver.setPosition( latlng );
      this.map.setCenter( latlng );

      this.lat = lat;
      this.lng = lng;

      this.onStreet();
      this.onLoadDistance();

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

  onLoadDistance( ) {
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

      this.distanceText = distance.rows[0].elements[0].distance.text || '';
      this.minutesText = distance.rows[0].elements[0].duration.text || '';
      this.distance = distance.rows[0].elements[0].distance.value || 0;
      this.minutes = distance.rows[0].elements[0].duration.value || 0;

      this.apps.distanceText = this.distanceText;
      this.apps.minutesText = this.minutesText;
      this.apps.minutes = this.minutes;
      this.apps.distance = this.distance;

      // if (this.distance <= 70 && this.distance >= 10) {
      //   this.sendPush = 0;
      // }

      if (!this.runDestination && this.sendPush < 2 ) {
        if ((this.distance <= 200 && this.distance >= 150) || (this.distance <= 70 && this.distance >= 10 ) ) {

          this.bodyPush.message = `Conductor en ${ this.currentStreet }, a ${ formatNumber( this.distance, 'en', '.1-1' ) } metros - ${ this.minutesText } de tu ubicación`;

          this.bodyPush.title = 'Llamataxi-app';
          this.bodyPush.osId = [ this.dataServiceInfo.osIdClient ];
          this.bodyPush.data = {
            accepted: false,
            deleted: false
          };

          if (this.pushDistance) {
            this.pushDistance.unsubscribe();
            // this.pushDistance = null;
          }

          this.pushDistance = this.os.onSendPushUser( this.bodyPush )
          // .pipe( retry() )
          .subscribe( async (resOs) => {
            this.sendPush += 1;
            console.log('push enviada', resOs);
            // await this.ui.onHideLoading();
            // this.navCtrl.navigateRoot('/home');
          });
        }
      }

      this.onEmitGeoDriverToClient();

    });
  }

  onUpdateTotalJournal(): Promise<boolean> {
    return new Promise( (resolve, reject) => {
      this.jdSbc = this.serviceSvc.onUpdateJournal( this.dataServiceInfo.pkService, this.dataServiceInfo.fkOffer )
      .subscribe( async (res) => {
        if (!res.ok) {
          reject( false );
        }
        await this.ui.onHideLoading();
        resolve( true );
      });
    });
  }

  async onShowModalCalification() {

    await this.ui.onShowLoading('Espere...');

    this.runDestination = false;
    this.finishDestination = true;
    const payload = {
      runOrigin: this.runOrigin,
      finishOrigin: this.finishOrigin,
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
      if (this.geoSbc) {
        this.geoSbc.unsubscribe();
      }
    });

    modalCalif.onDidDismiss().then( async (res) => {
      await this.ui.onShowLoading('Espere...');
      await this.onResetStorage();


      // this.io.onEmit('occupied-driver', { occupied: false, pkUser: this.st.pkUser }, (resOccupied) => {
      //   console.log('Cambiando estado conductor', resOccupied);
      // });

      if (res.data.ok) {
        await this.ui.onHideLoading();
      }

      window.tracker.backgroundGeolocation.stop();
      this.navCtrl.navigateRoot('/home').then( async () => {

        await this.ui.onHideLoading();

      });

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
      pkService: this.st.pkService
    };

    this.io.onEmit('current-position-driver-service', payload, (resIO: IResSocketCoors) => {

      if (resIO.ok) {

        if ( this.st.indexHex !== resIO.indexHex ) {
          this.st.indexHex = resIO.indexHex;
          this.st.onSetItem('indexHex', resIO.indexHex, false);
        }

      }
      console.log('Emitiendo ubicación del conductor al cliente =====', resIO);
    });

  }

  onSharedGeo() {
    // let msg = `Desde ${ this.dataServiceInfo.streetOrigin }, `;
    // msg += `hasta ${ this.dataServiceInfo.streetDestination }.`;
    // msg += `Conductor ${ this.dataServiceInfo.nameDriver }`;
    // const url = `http://www.google.com/maps/place/${ this.lat },${ this.lng }`;

    const msg = '🚨🚨 Monitorear servicio 🚨🚨';
    const subject = 'Monitrea en tiempo real la ubicación y la información del viaje y vigila la integridad del conductor y pasajero';
    const url = URI_API + `/#/segurity/monitor/${ this.dataService.monitorToken }`;
    this.sh.share( subject, msg, '', url ).then( (resShared) => {
      console.log('Se compartió ubicación exitosamente', resShared);
    }).catch( e => console.error( 'Error al compartir ubicación', e ) );
  }

  onMoreInfo() {
    this.viewMore = !this.viewMore;
    setTimeout(() => {
      this.showMoreCard = !this.showMoreCard;
    }, 2000);
  }

  async onConfirmDel() {
    this.loadingConfirm = true;
    const confirmDel = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Está seguro de <b class="text-danger">cancelar</b> el servicio de taxi?',
      cssClass: 'alert-confirm',
      mode: 'ios',
      buttons: [{
        text: 'No',
        role: 'not',
        cssClass: 'text-dark',
        handler: () => {}
      }, {
        text: 'Aceptar',
        role: 'yes',
        cssClass: 'text-primary',
        handler: async () => {

          await this.ui.onShowLoading('Cancelando servicio...');
          this.onDeleteRun();
        }
      }]
    });

    confirmDel.present().then( () => {
      this.loadingConfirm = false;
    }).catch( e => console.log('Error al abrir confirmación') );
  }

  onDeleteRun() {

    this.deleteSbc = this.serviceSvc.onDeleteRun( this.dataServiceInfo.pkService, false )
    // .pipe( retry() )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      if (res.showError === 1) {
        await this.ui.onHideLoading();
        await this.ui.onShowToast('No se encontró servicio', 3500);
      } else if (res.showError === 2) {
        await this.onResetStorage();
        await this.ui.onHideLoading();
        await this.ui.onShowToast('Este servicio ya ha sido cancelado', 3500);
        this.io. onEmit('occupied-driver', { occupied: false, pkUser: this.st.pkUser }, (resOccupied) => {
          console.log('Cambiando estado conductor', resOccupied);
        });
        this.navCtrl.navigateRoot('/home');
      } else {
        await this.onResetStorage();
        this.io.onEmit('occupied-driver', { occupied: false, pkUser: this.st.pkUser }, (resOccupied) => {
          console.log('Cambiando estado conductor', resOccupied);
        });
        // await this.ui.onHideLoading();
        await this.ui.onShowToast('Servicio cancelado con éxito ', 3500);
        this.onEmitCancel();
      }

    });
  }

  async onResetStorage() {
    await this.st.onSetItem('current-page', '/home', false);
    await this.st.onSetItem('current-service', null, false);
    await this.st.onSetItem('occupied-driver', false, false);
    await this.st.onSetItem('playGeo', true, false);
    await this.st.onSetItem('run', false, false);
    this.st.occupied = false;
    this.st.playGeo = true;
    this.apps.run = false;
    this.apps.pkClient = 0;
    this.st.pkService = 0;
  }

  onEmitCancel() {
    this.bodyPush.title = 'Llamataxi-app 🚨🚨';
    this.bodyPush.message = `${ this.dataServiceInfo.nameDriver }, ha cancelado el servicio 😌.`;
    this.bodyPush.osId = [ this.dataServiceInfo.osIdClient ];
    this.bodyPush.data = { declined: true, accepted: false, url: '/home' };
    const payloadDel = { msg: this.bodyPush.message, pkUser: this.dataServiceInfo.fkClient };
    this.io.onEmit('cancel-service-run', payloadDel, (res) => {
      console.log('emitiendo cancelación de servicio');
    });

    this.osSbc = this.os.onSendPushUser( this.bodyPush )
    // .pipe( retry() )
    .subscribe( async (resOs) => {
      console.log('push enviada', resOs);
      await this.ui.onHideLoading();
      this.navCtrl.navigateRoot('/home');
      // this.backgroundGeolocation.stop();
    });
  }

  async onShowAlert() {
    this.showAlert = true;

    if ( this.successAlert || this.dangerAlert) {

      setTimeout(() => {
        this.hideAlert = true;
      }, 8000);
      setTimeout(() => {
        this.showAlert = false;
        this.seconds = 0;
        this.hideAlert = false;
      }, 8500);
      return false;
    }

    setTimeout(() => {
      this.intervalo = this.getInterval().subscribe( (n) => {
        this.seconds = n;

        if (this.seconds === 0) {
          // console.log('emitiendo alerta');

          this.loadingAlert = true;
          const payload = {
            pkService: this.dataServiceInfo.pkService,
            fkPerson: this.st.pkPerson,
            fkUser: this.st.pkUser,
            isClient: false,
            lat: this.lat,
            lng: this.lng,
          };
          this.io.onEmit('panic_travel', payload, (resSocket: IResSocket) => {
            // console.log('respuesta socket alert', resSocket);

            if (resSocket.ok) {

              this.successAlert = resSocket.showError === 0 ? true : false;
              this.dangerAlert = resSocket.showError === 0 ? false : true;
              this.msgAlert = resSocket.message;

              this.loadingAlert = false;

              setTimeout(() => {
                this.hideAlert = true;
              }, 4000);

              setTimeout(() => {

                // this.seconds = resSocket.showError === 0 ? 5 : 0;
                this.showAlert = false;
                this.hideAlert = false;
              }, 4500);

            } else {
              console.error('Error al emitir alerta');
            }

          });

        }

      });
    }, 2000);

  }

  onCancelAlert() {
    this.hideAlert = true;
    setTimeout(() => {
      this.showAlert = false;
      this.seconds = 3;
      this.hideAlert = false;
    }, 1500);
    this.intervalo.unsubscribe();
    this.intervalo = null;
  }

  getInterval(): Observable<number> {
    // seconds = 3;
    return interval(1000).pipe(
      map( () => this.seconds -= 1 ),
      take(3)
    );

    // obsAlert.subscribe();
  }

  // modal chat

  async onShowChat() {
    const modalChat = await this.modalCtrl.create({
      mode: 'ios',
      animated: true,
      component: ModalChatPage,
      componentProps: {
        pkService: this.dataServiceInfo.pkService,
        nameComplete: this.dataServiceInfo.nameDriver,
        pkUser: this.st.pkUser,
        fkUserReceptor: this.dataServiceInfo.fkClient
      }
    });

    modalChat.present().then( () => {
      this.loadModalChat = true;
      this.newMessages = 0;
      if (this.chatSbc) {
        this.chatSbc.unsubscribe();
      }
    }).catch( e => console.error('Error al abrir chat modal', e)  );

    modalChat.onDidDismiss().then( (res) => {
      this.loadModalChat = false;
      // console.log('Cerrando chat' , res.data);
      this.onListenNewMsgChat();
    });

  }

  onListenNewMsgChat() {

    // console.log('Escuchando nuevos mensajes de chat=================')
    this.chatSbc = this.io.onListen('new-chat-message').pipe( retry() ).subscribe( (res) => {

      console.log('socket recibido chat', res);
      this.newMessages += 1;

      // Setup the new Howl.
      const sound = new Howl({
        src: ['./assets/iphone-noti.mp3']
      });

      // Play the sound.
      sound.play();

    });
  }

  ngOnDestroy() {
    if (this.infoServiceSbc) {
      this.infoServiceSbc.unsubscribe();
    }

    if (this.cancelRunSbc) {
      this.cancelRunSbc.unsubscribe();
    }
    if (this.geoSbc) {
      this.geoSbc.unsubscribe();
    }
    if (this.osSbc) {
      this.osSbc.unsubscribe();
    }
    if (this.deleteSbc) {
      this.deleteSbc.unsubscribe();
    }

    if (this.pushDistance) {
      this.pushDistance.unsubscribe();
    }

    if ( this.intervalo ) {
      this.intervalo.unsubscribe();
    }

    if (this.chatSbc) {
      this.chatSbc.unsubscribe();
    }

    if (this.jdSbc) {
      this.jdSbc.unsubscribe();
    }

  }

}
