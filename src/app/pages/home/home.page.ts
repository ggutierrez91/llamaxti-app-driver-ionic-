import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { IResDisposal, IResSocket, IResSocketCoors } from '../../interfaces/response-socket.interface';
import { TaxiService } from '../../services/taxi.service';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { IPolygons, IServiceSocket, IServices, IServiceAccepted } from '../../interfaces/services.interface';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { IOffer, ISocketOffer } from '../../interfaces/offer.interface';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { retry } from 'rxjs/operators';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { GeoService } from 'src/app/services/geo.service';
import { IHotPolygons } from 'src/app/interfaces/hotZones.interface';
import { formatNumber } from '@angular/common';
import { OfferModel } from '../../models/offer.model';
import { PushModel } from '../../models/push.model';
import { NotyModel } from '../../models/notify.model';
import { PushService } from '../../services/push.service';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { AppUtilitiesService } from '../../services/app-utilities.service';
import { Howl } from 'howler';

const URI_SERVER = environment.URL_SERVER;

declare var window;

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
  cardsSbc: Subscription;
  declineSbc: Subscription;
  offerSbc: Subscription;
  osSbc: Subscription;
  socktJournalbc: Subscription;
  socketServicesSbc: Subscription;
  socketOfferSbc: Subscription;
  soketCancelSbc: Subscription;

  map: google.maps.Map;
  marker: google.maps.Marker;

  codeJournal = 'DIURN';

  totalServicesZone = 0;
  totalDriverZone = 0;

  infoWindowPolygon: google.maps.InfoWindow;
  dataPolygons: IPolygons[] = [];
  arrPolygons: IHotPolygons[] = [];

  lat = -12.054825;
  lng = -77.040627;
  indexColor = 0;
  indexHex = 'leonidas';
  demandColors = ['#0091F2', '#209FF4', '#40ADF5', '#60BAF7', '#80C8F8', '#9FD6FA'];

  currentIdService = 0;

  // variables para cards
  bodyAcceptOffer: OfferModel;
  bodyPush: PushModel;
  bodyNoty: NotyModel;
  dataServices: IServices[] = [];
  pathImg = URI_SERVER + '/User/Img/Get/';

  slidesOptions = {
    spaceBetween: 2.5,
    slidesPerView: 1.5,
  };

  showMoreCard = false;
  hideSlideCard = false;
  dataMore: IServices;
  originRate = 0;
  loadingDel = false;
  pkServiceDel = 0;

  showBtnPlay = false;

  // tslint:disable-next-line: max-line-length
  constructor( public io: SocketService,  private geo: GeoService,  private taxiSvc: TaxiService, public st: StorageService, private router: Router, private vehicleSvc: VehicleService, private alertCtrl: AlertController, private navCtrl: NavController, private ui: UiUtilitiesService, private zombie: Insomnia, private os: PushService, private apps: AppUtilitiesService ) { }

  ngOnInit() {

    this.bodyAcceptOffer = new OfferModel();
    this.bodyPush = new PushModel();
    this.bodyNoty = new NotyModel('/notification', this.st.pkUser);
    this.zombie.keepAwake().then(
      (success) => console.log('Teléfono en estado zombie :D') ,
      (e) => console.log('Error al prevenir bloqueo de pantalla', e)
    );

    this.onLoadMap();
    this.apps.onLoadTokenTacker();
    this.st.onLoadJournal().then( () => {

      // cargando jornada laboral
      // console.log('data journal driver',this.st.dataJournal);
      this.onLoadJournalDriver();

    }).catch( e => console.error('Error al cargar jorunal storage', e) );

    this.st.onLoadToken().then( () => {
      // this.indexHex = this.st.indexHex;
      this.st.occupied = false;
      this.io.onEmit('occupied-driver', { occupied: false, pkUser: this.st.pkUser }, (resOccupied) => {
        console.log('Cambiando estado conductor', resOccupied);
      });

      setTimeout(() => {
        this.showBtnPlay = true;
      }, 1000);

      this.onLoadMap();
      this.onLoadJournal();
      this.onGetPosition();

      this.st.onLoadVehicle().then( () => {
        if (this.st.pkVehicle === 0 ) {
          this.onGetVehicleUsing();
        }
      });
      this.onListenOfferClient();
      this.onListenNewService();
      this.onListenJournal();
      this.onListenCancelService();
    });

    this.infoWindowPolygon = new google.maps.InfoWindow();

  }

  onLoadJournalDriver() {

    this.st.onLoadJournal().then( async () => {

      if ( !this.st.dataJournal.pkJournalDriver || this.st.dataJournal.pkJournalDriver === 0 || this.st.dataJournal.expired) {

        const alertJournal = await this.alertCtrl.create({
          header: 'Mensaje al usuario',
          message: 'Por favor aperture una nueva jornada laboral',
          mode: 'ios',
          translucent: true,
          buttons: [{
            text: 'Aceptar',
            handler: () => {

            }
          }]
        });

        await alertJournal.present();

      }

    }).catch(e => console.error('Error al cargar jornada laboral storage', e) ); // cargando jornada laboral

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
  }

  onGetPosition() {
    this.geo.onGetGeo().then( (geo) => {

      const lat = geo.coords.latitude;
      const lng = geo.coords.longitude;

      this.map.setCenter( new google.maps.LatLng( lat, lng ) );
      this.map.setZoom(13.4);

      this.marker = new google.maps.Marker({
        position: new google.maps.LatLng( lat, lng ),
        animation: google.maps.Animation.DROP,
        map: this.map
      });

      this.io.onEmit('change-play-geo', { value: this.st.playGeo }, (resIO: any) => {

        if (this.st.playGeo) {

          this.io.onEmit('current-position-driver', {lat, lng }, (res: IResSocketCoors) => {

            console.log('Respuesta socket coords', res);
            this.indexHex = res.indexHex;
            if (res.ok) {
                // this.st.indexHex = res.indexHex;
                // this.st.onSetItem('indexHex', res.indexHex, false);
                this.onGetHotZones();
                this.onGetServices(1);

            } else {
              console.error('Error al actualizar coordenadas socket');
            }

          });

          this.onEmitGeo();

          setTimeout(() => {
            window.tracker.backgroundGeolocation.start();
          }, 3000);
        }

      });

    });
  }

  onEmitGeo() {
    this.geoSbc = this.geo.onListenGeo( ).pipe( retry(3) )
    .subscribe(
      (position: Geoposition) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const latlng = new google.maps.LatLng( lat, lng );
        this.marker.setPosition( latlng );
        this.map.setCenter( latlng );

        this.onEmitCurrentPosition(lat, lng);

      },
      (e) => console.error('Surgio un errora l observar geo', e));

  }

  onEmitCurrentPosition( lat: number, lng: number ) {
    this.io.onEmit('current-position-driver', {lat, lng }, (res: IResSocketCoors) => {

      // console.log('Respuesta socket coords', res);
      if (res.ok) {

        const oldIndexHex = this.indexHex;
        if ( oldIndexHex !== res.indexHex ) {
          this.indexHex = res.indexHex;
          this.st.indexHex = res.indexHex;
          // this.st.onSetItem('indexHex', res.indexHex, false);
          this.onGetServices(1);

          const findCurrentPolygon = this.arrPolygons.find( pp => pp.indexHex === res.indexHex );
          if (findCurrentPolygon) {

            const oldColor = findCurrentPolygon.color;

            findCurrentPolygon.polygon.setOptions({
              strokeColor: '#f7793fd8',
              fillColor: '#f7793fd8'
            });

            const oldPolygon = this.arrPolygons.find( pp => pp.indexHex === oldIndexHex );

            if (oldPolygon) {
              oldPolygon.polygon.setOptions({
                strokeColor: oldColor,
                fillColor: oldColor
              });
            }

          }

        }

      } else {
        console.error('Error al actualizar coordenadas socket', res);
      }

    });
  }

  onChangePlayGeo() {

    this.st.playGeo = !this.st.playGeo;
    // console.log('Play geo', this.st.playGeo);

    this.io.onEmit('change-play-geo', { value: this.st.playGeo }, async (resIO: any) => {
          await this.st.onSetItem('playGeo', this.st.playGeo, false);
          console.log('cambiando playGeo socket', resIO);

          if (this.st.playGeo) {

            const modalTracker = await this.alertCtrl.create({
              header: 'Mensaje al usuario',
              subHeader: 'Activando localización en segundo plano',
              message: 'Con ella podrás seguir activo y pendiente de nuevos servicios aunque la app este minimizada',
              mode: 'ios',
              buttons: [{
                text: 'Ok',
                handler: () => {  }
              }]
            });
            modalTracker.present();
            this.onEmitGeo();

            window.tracker.backgroundGeolocation.start();

          } else {

            window.tracker.backgroundGeolocation.stop();
            if (this.geoSbc) {
              this.geoSbc.unsubscribe();
            }
          }

    });

  }

  // funciones para cards services
  onGetServices( page: number ) {

    this.cardsSbc = this.taxiSvc.onGetServices( page )
    // .pipe( retry() )
    .subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataServices = res.data;

      if (this.hideSlideCard) {
        this.hideSlideCard = false;

        setTimeout(() => {
          this.showMoreCard = false;
        }, 2100);
      }

    });

  }

  onCloseService( service: IServices ) {

    this.loadingDel = true;
    this.pkServiceDel = service.pkService;
    const body = {
      pkOffer: service.pkOfferService,
      pkService: service.pkService
    };

    this.declineSbc = this.taxiSvc.onDeclineOffer( body ).subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      const dpp = this.arrPolygons.find( pp => pp.indexHex === service.indexHex );
      if (dpp) {
        dpp.totalServices -= 1;

        if (dpp.totalServices === 0) {
          dpp.polygon.setMap(null);
        }

      }

      this.pkServiceDel = 0;
      this.loadingDel = false;
      this.dataServices = this.dataServices.filter( item => item.pkService !== service.pkService );

    });
  }

  onShowMoreCard( service: IServices ) {
    this.originRate = service.rateOffer;
    this.dataMore = service;
    this.hideSlideCard = true;
    this.showMoreCard = true;
  }

  onHideMoreCard() {
    this.hideSlideCard = false;

    setTimeout(() => {
      this.dataMore.rateOffer = this.originRate;
    }, 500);

    this.showMoreCard = false;
    // setTimeout(() => {
    // }, 2100);
  }
  /*CÓDIGO SUBASTA SERVICIO
  async onMinusRate(  ) {
    const percent = this.dataMore.minRatePercent;
    const minrate = (this.dataMore.rateHistory * percent)  / 100;
    if ( (this.dataMore.rateOffer - 0.50) < minrate || (this.dataMore.rateOffer - 0.50) < this.dataMore.minRate ) {
      let msg = `La tarifa mìnima es de ${ formatNumber( minrate, 'es', '.2-2' ) }`;
      if ((this.dataMore.rateOffer - 0.50) < this.dataMore.minRate) {
        msg = `La tarifa mìnima es de ${ formatNumber( this.dataMore.minRate, 'es', '.2-2' ) }`;
      }

      return await this.ui.onShowToast(msg, 4500);
    }
    this.dataMore.rateOffer -= 0.50;

    if (this.dataMore.rateOfferHistory !== this.dataMore.rateOffer) {
      this.dataMore.changeRate = true;
    } else {
      this.dataMore.changeRate = false;
    }

  }

  async onPlusRate(  ) {
    const maxrate = this.dataMore.rateHistory + 5;

    if ( (this.dataMore.rateOffer + 0.50) > maxrate ) {
      return await this.ui.onShowToast(`La tarifa máxima es de ${ formatNumber( maxrate, 'es', '.2-2' ) }`, 4500);
    }

    this.dataMore.rateOffer += 0.50;

    if (this.dataMore.rateOfferHistory !== this.dataMore.rateOffer) {
      this.dataMore.changeRate = true;
    } else {
      this.dataMore.changeRate = false;
    }

  }
  */

  async onAcceptOffer(  ) {

    if (this.st.pkVehicle === 0) {
      const alertVerify = await this.alertCtrl.create({
        header: 'Mensaje al usuario',
        message: 'Por favor verifique tener un vehículo seleccionado',
        mode: 'ios',
        animated: true,
        buttons: [{
          text: 'Ok',
          handler: () => {}
        }]
      });

      await alertVerify.present();
      return;
    }

    if (this.st.dataJournal.pkJournalDriver === 0 || this.st.dataJournal.expired) {
      const message = this.st.dataJournal.expired ? 'Tu jornada ha expirado 🕗' : 'No tienes una jornada abierta vigente 🚨';
      const alertVerify = await this.alertCtrl.create({
        header: 'Mensaje al usuario',
        message,
        mode: 'ios',
        animated: true,
        buttons: [{
          text: 'Aceptar',
          handler: () => {}
        }]
      });

      await alertVerify.present();
      return;
    }

    const osIdClient = this.dataMore.osId;

    this.bodyAcceptOffer.pkService = this.dataMore.pkService;
    this.bodyAcceptOffer.pkOffer = this.dataMore.pkOfferService;
    this.bodyAcceptOffer.rateOffer = this.dataMore.rateOffer;
    this.bodyAcceptOffer.fkDriver = this.st.pkUser;
    this.bodyAcceptOffer.fkVehicle = this.st.pkVehicle;
    this.bodyAcceptOffer.fkJournal = this.st.dataJournal.pkJournalDriver;
    this.bodyAcceptOffer.codeJournal = this.st.dataJournal.codeJournal;

    await this.ui.onShowLoading('Enviando oferta...');

    this.offerSbc = this.taxiSvc.onNewOffer( this.bodyAcceptOffer )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.hideSlideCard = false;
      setTimeout(() => {
        this.showMoreCard = false;
      }, 500);

      await this.ui.onHideLoading();
      this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

      let msg = `${ this.st.nameComplete }, ha aceptado tu oferta de S/ ${ formatNumber( this.dataMore.rateOffer, 'en', '.2-2' ) }`;
      if (this.dataMore.changeRate) {
        msg = `${ this.st.nameComplete }, acepta llevarte por S/ ${ formatNumber( this.dataMore.rateOffer, 'en', '.2-2' ) }`;
      }
      this.bodyNoty.notificationTitle = `🔔📢Nueva oferta-llamataxiApp`;
      this.bodyNoty.notificationSubTitle = `De ${ this.dataMore.streetOrigin } hasta ${ this.dataMore.streetDestination }`;
      this.bodyNoty.notificationMessage = msg;

      if (res.showError === 0 ) {

        const payloadService: IServices = this.dataMore;
        payloadService.streetOrigin = this.dataMore.streetOrigin;
        payloadService.streetDestination = this.dataMore.streetDestination;
        payloadService.distanceText = this.dataMore.distanceText;
        payloadService.minutesText = this.dataMore.minutesText;
        payloadService.minutes = this.dataMore.minutes;
        payloadService.distance = this.dataMore.distance;
        payloadService.fkCategory = this.st.fkCategory;
        payloadService.aliasCategory = this.st.category;
        payloadService.codeCategory = this.st.codeCategory;
        payloadService.color = this.st.color;
        payloadService.numberPlate = this.st.numberPlate;
        payloadService.year = this.st.year;
        payloadService.nameBrand = this.st.brand;
        payloadService.nameModel = this.st.nameModel;
        payloadService.pkVehicle = this.st.pkVehicle;
        payloadService.rateOfferHistory = this.bodyAcceptOffer.rateOffer;
        payloadService.rateOffer = this.bodyAcceptOffer.rateOffer;

        payloadService.nameComplete = this.st.dataUser.nameComplete;

        payloadService.img = this.st.dataUser.img;
        payloadService.fkDriver = this.st.dataUser.pkUser;
        payloadService.pkDriver = this.st.dataUser.pkDriver;
        payloadService.osId = this.st.osID;
        payloadService.changeRate = false;
        payloadService.pkOfferService = res.data.pkOffer;
        payloadService.dateOfferDriver = res.data.dateOffer;
        payloadService.imgTaxiFrontal = this.st.imgTaxiFrontal || 'xd.png';

        this.io.onEmit('newOffer-driver', { pkClient: this.dataMore.fkClient,
                                            dataOffer: payloadService }, (resSocket) => {
          console.log('Enviando nueva oferta socket', resSocket);
          this.dataServices = this.dataServices.filter( ts => ts.pkService !== this.dataMore.pkService );
          this.onSendPush('📢📢Nueva oferta - llamataxi app', msg, osIdClient);
        });

      }

    });

  }

  onGetError( showError: number ) {
    let arrError = showError === 0 ? ['Contra-oferta enviada con éxito'] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError = ['Error', 'no se encontró servicio'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrError.push('servicio no disponible');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrError.push('servicio cancelado por el cliente');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrError = ['Error', 'no se encontró conductor'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrError = ['Error', 'conductor pendiente de verificación'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrError.push('conductor inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 64) {
      arrError = ['Error', 'vehículo no identificado'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 128) {
      arrError.push('vehículo pendiente de verificación');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 256) {
      arrError.push('no se encontró jornada');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 512) {
      arrError.push('jornada cerrada');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 1024) {
      arrError.push('jornada expiró');
    }

    return arrError.join(', ');

  }

  onSendPush( title: string, msg: string, osId: string ) {

    this.bodyPush.message = msg;
    this.bodyPush.title = title;
    this.bodyPush.osId = [osId];
    this.bodyPush.data = { declined: false };

    this.osSbc = this.os.onSendPushUser( this.bodyPush )
    .subscribe( (res) => {
        console.log('push enviado con èxito', res);
    });

  }

  // funciones para cards services

  onLoadJournal() {

    this.journalSbc = this.taxiSvc.onGetJournal()
    // .pipe( retry() )
    .subscribe( (res) => {
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

  onListenOfferClient() {
    this.socketOfferSbc = this.io.onListen( 'newOffer-service-client' )
    .pipe( retry() )
    .subscribe( async (res: ISocketOffer) => {
      console.log('home acepted service', res);
      if (res.accepted) {
        const offer: IServices = res.dataOffer;
        const alertService = await this.alertCtrl.create({
          header: 'Mensaje al usuario',
          subHeader: 'Iniciando servicio de taxi ✅',
          message: `${ offer.nameComplete }, ha aceptado tu oferta, por favor sirvace a pasar por su pasajero en: ${ offer.streetOrigin }`,
          mode: 'ios',
          buttons: [{
            text: 'Ok',
            cssClass: 'text-info',
            handler: async () => {
              await this.ui.onShowLoading('Espere....');

              await this.st.onSetItem('current-service', offer, true);
              await this.st.onSetItem('current-page', '/service-run', false);
              await this.st.onSetItem('occupied-driver', true, false);
              await this.st.onSetItem('playGeo', true, false);
              await this.st.onSetItem('run', true);
              this.st.playGeo = true;

              this.io.onEmit('occupied-driver', { occupied: true, pkUser: this.st.pkUser }, (resOccupied) => {
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
         this.dataServices.unshift( res.dataOffer );
       }
    });
  }

  onListenJournal() {
    this.socktJournalbc = this.io.onListen('change-journal')
    // .pipe( retry() )
    .subscribe( (res: any) => {
      const styleMap: any = res.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
      this.map.setOptions({
        styles: styleMap
      });
      this.st.onSetItem('codeJournal', res.codeJournal, false);
    });
  }

  onGetVehicleUsing() {

    this.usingSbc = this.vehicleSvc.onGetUsing( this.st.pkDriver )
    // .pipe( retry() )
    .subscribe( async ( res ) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      if ( !res.data ) {
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
      await this.st.onSetItem('codeCategory', res.data.codeCategory, false);

      this.io.onEmit('change-category',
                      { pkCategory: res.data.pkCategory, codeCategory: res.data.codeCategory },
                      ( resSocket: IResSocket ) => {
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

  onGetHotZones() {

    this.demandSbc = this.taxiSvc.onGetDemand().pipe( retry() ).subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataPolygons = res.data;
      this.indexColor = 0;
      this.dataPolygons.forEach( dp => {
        this.onBuildPolygon( dp.indexHex, dp.center, dp.polygon, dp.total, dp.totalDrivers );
      });

    });
  }

  onBuildPolygon(indexHex: string, center: number[], vertices: number[][], totalServices = 0, totalDrivers = 0) {

    const positionPolygon = new google.maps.LatLng( center[0], center[1] );
    const verticesCoords: google.maps.LatLng[] = [];
    const color = this.demandColors[this.indexColor];
    vertices.forEach( (coords) => {
      verticesCoords.push( new google.maps.LatLng( coords[0], coords[1] ) );
    });

    const hotPolygon = new google.maps.Polygon({
      paths: verticesCoords,
      strokeColor: this.indexHex === indexHex ? '#f7793fd8' : color,
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: this.indexHex === indexHex ? '#f7793fd8' : color,
      fillOpacity: 0.35,
      map: this.map
    });


    // Add a listener for the click event.
    hotPolygon.addListener('click', (data: any) => {
      this.infoWindowPolygon.setContent(this.infoPolygon.nativeElement);
      this.infoWindowPolygon.setPosition( positionPolygon );

      // const tServices = this.arrPolygons.find( pp => pp.indexHex === indexHex ).totalServices || 0;
      // const tDrivers = this.arrPolygons.find( pp => pp.indexHex === indexHex ).totalDrivers || 0;

      this.totalServicesZone = totalServices;
      this.totalDriverZone = totalDrivers;

      this.infoWindowPolygon.open(this.map);
    });
    this.arrPolygons.push( { indexHex,
                            totalServices,
                            totalDrivers,
                            polygon: hotPolygon,
                            color} );

    if (this.indexColor <= 5) {
      this.indexColor++;
    }
  }

  onListenNewService() {
    this.socketServicesSbc = this.io.onListen('new-service')
    .pipe( retry() )
    .subscribe( (resSocket: IServiceSocket) => {
      // recibimos la data del nuevo servicio
      // this.onLoadSound();
      const indexHex = resSocket.indexHex;
      // console.log('socket new service', resSocket);

      if ( indexHex === this.indexHex) {
        this.dataServices.unshift( resSocket.data );
        console.log(this.dataServices);
      }

      const polygonFinded = this.arrPolygons.find( polygon => polygon.indexHex === indexHex );

      if (!polygonFinded) {

        this.onBuildPolygon( indexHex, resSocket.center, resSocket.polygon, 1, resSocket.totalDrivers );

      } else {

        polygonFinded.totalServices += 1;
        polygonFinded.totalDrivers = resSocket.totalDrivers;

        if (!polygonFinded.polygon.getMap()) {
          polygonFinded.polygon.setMap(this.map);
        }

      }

    });
  }

  onLoadSound() {

    // Setup the new Howl.
    const sound = new Howl({
      src: ['./assets/iphone-noti.mp3']
    });

    // Play the sound.
    sound.play();

  }

  onListenCancelService() {
    this.soketCancelSbc = this.io.onListen('disposal-service')
    .pipe( retry() )
    .subscribe( (res: IResDisposal) => {

      // console.log('socket cancel service', res);

      this.dataServices = this.dataServices.filter( ss => ss.pkService !== res.pkService );
      if (res.fkUserDriver && res.fkUserDriver !== this.st.pkUser) {
        this.ui.onShowToast( res.msg, 4500 );
      }
      
      if (!res.fkUserDriver) {
        this.ui.onShowToast( res.msg, 4500 );
      }
      // console.log(this.dataServices);
      // if (res.indexHex === this.st.indexHex) {
      // }

      const polygonFinded = this.arrPolygons.find( polygon => polygon.indexHex === res.indexHex );

      if (polygonFinded && polygonFinded.totalServices > 0) {

        polygonFinded.totalServices -= 1;

        if (polygonFinded.totalServices === 0) {
          polygonFinded.polygon.setMap(null);
        }

      }

    });
  }

  ngOnDestroy() {
    console.log('Destruyendo home');
    if (this.geoSbc) {
      this.geoSbc.unsubscribe();
    }
    this.journalSbc.unsubscribe();
    if (this.serviceSbc) {
      this.serviceSbc.unsubscribe();
    }
    if (this.demandSbc) {
      this.demandSbc.unsubscribe();
    }

    if (this.declineSbc) {
      this.declineSbc.unsubscribe();
    }

    this.soketCancelSbc.unsubscribe();
    this.socketOfferSbc.unsubscribe();
    this.socketServicesSbc.unsubscribe();
    this.socktJournalbc.unsubscribe();

  }

}
