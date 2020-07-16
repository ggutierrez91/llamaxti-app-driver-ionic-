import { Component, OnInit, OnDestroy } from '@angular/core';
import { IServices } from 'src/app/interfaces/services.interface';
import { TaxiService } from '../../services/taxi.service';
import { StorageService } from '../../services/storage.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { formatNumber } from '@angular/common';
import { OfferModel } from '../../models/offer.model';
import { PushService } from '../../services/push.service';
import { NotyModel } from '../../models/notify.model';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { NavController, AlertController } from '@ionic/angular';
import { IOffer } from 'src/app/interfaces/offer.interface';
import { PushModel } from '../../models/push.model';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.page.html',
  styleUrls: ['./services-list.page.scss'],
})
export class ServicesListPage implements OnInit, OnDestroy {

  servicesSbc: Subscription;
  offerSbc: Subscription;
  offerAcceptSbc: Subscription;
  osSbc: Subscription;
  notySbc: Subscription;
  socketServicesSbc: Subscription;
  socketOfferSbc: Subscription;
  cancelSbc: Subscription;

  dataServices: IServices[] = [];
  pathImg = URI_SERVER + '/User/Img/Get/';
  loading = false;

  bodyOffer: OfferModel;
  bodyAcceptOffer: OfferModel;
  bodyNoty: NotyModel;
  bodyPush: PushModel;

  // tslint:disable-next-line: max-line-length
  constructor(private services: TaxiService, public st: StorageService, private ui: UiUtilitiesService, private os: PushService, private notySvc: NotificationService, private io: SocketService, private navCtrl: NavController, private alertCtrl: AlertController) { }

  ngOnInit() {

    this.bodyOffer = new OfferModel();
    this.bodyAcceptOffer = new OfferModel();
    this.bodyPush = new PushModel();

    this.st.onLoadVehicle();
    this.st.onLoadToken().then( (res) => {
      this.onGetServices(1);
      this.bodyNoty = new NotyModel('/notification', this.st.pkUser);

      this.onListenNewService();
      this.onListenOfferClient();
      this.onListenCancelService();
    }).catch( (e) => console.error('Error al cargar token storage') );
  }

  onListenCancelService() {
    this.cancelSbc = this.io.onListen('client-cancel-service').subscribe( async (next: any) => {
      this.dataServices = this.dataServices.filter( svc => svc.pkService !== next.pkService );
      await this.ui.onShowToast( next.msg );
    });
  }

  onListenNewService() {
    this.socketServicesSbc = this.io.onListen('new-service').subscribe( (resSocket: any) => {
      // recibimos la data del nuevo servicio
      const newService: IServices = resSocket.data;

      this.ui.onShowToast('Nuevo servicio cerca de aquí', 4000);
      this.dataServices.unshift( newService );
      // this.onGetServices(1);
    });
  }

  onListenOfferClient() {
    this.socketOfferSbc = this.io.onListen( 'newOffer-service-client' ).subscribe( async (res: any) => {
      console.log('llego una oferta cliente', res);
      if (res.accepted) {
        const offer: IOffer = res.dataOffer;
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

              await this.st.onSetItem('loadCalification', false, false);
              await this.st.onSetItem('loadRoute', false, false);
              await this.st.onSetItem('runOrigin', true, false);
              await this.st.onSetItem('finishOrigin', false, false);
              await this.st.onSetItem('runDestination', false, false);
              await this.st.onSetItem('finishDestination', false, false);
              await this.st.onSetItem('current-service', res.dataOffer, true);
              this.io. onEmit('occupied-driver', { occupied: true }, (resOccupied) => {
                console.log('Cambiando estado conductor', resOccupied);
              });
              await this.ui.onHideLoading();
              this.navCtrl.navigateRoot('/service-run', {animated: true});
            }
          }]
        });
        await alertService.present();
        // el cliente acepto la oferta y comienza el servicio de taxi
      } else {
        // el cliente hizo una contra oferta
        this.dataServices.unshift(res.dataOffer);
      }
    });
  }

  onGetServices( page: number ) {
    this.loading = true;
    this.servicesSbc = this.services.onGetServices( page ).subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataServices = res.data;
      this.loading = false;
    });

  }

  async onMinusRate( service: IServices ) {
    const percent = service.minRatePercent;
    const minrate = (service.rateHistory * percent)  / 100;
    console.log(` tarifa minima ${ minrate } -> ${  percent }`);
    if ( (service.rateOffer - 0.20) < minrate ) {
      return await this.ui.onShowToast(`La tarifa mìnima es de ${ formatNumber( minrate, 'es', '.2-2' ) }`, 4500);
    }
    service.rateOffer -= 0.20;

    if (service.rateOfferHistory !== service.rateOffer) {
      service.changeRate = 1;
    } else {
      service.changeRate = 0;
    }

  }

  async onPlusRate( service: IServices ) {
    const maxrate = service.rateHistory + 5;

    if ( (service.rateOffer + 0.20) > maxrate ) {
      return await this.ui.onShowToast(`La tarifa máxima es de ${ formatNumber( maxrate, 'es', '.2-2' ) }`, 4500);
    }

    service.rateOffer += 0.20;

    if (service.rateOfferHistory !== service.rateOffer) {
      service.changeRate = 1;
    } else {
      service.changeRate = 0;
    }

  }

  async onAcceptOffer( service: IServices ) {
    const osIdClient = service.osId;
    // console.log('osid cliente', osIdClient);
    // // tslint:disable-next-line: no-debugger
    // debugger;
    this.bodyAcceptOffer.pkService = service.pkService;
    this.bodyAcceptOffer.pkOffer = service.pkOfferService;
    this.bodyAcceptOffer.rateOffer = service.rateOffer;
    this.bodyAcceptOffer.fkDriver = this.st.dataUser.pkUser || 0;
    this.bodyAcceptOffer.fkVehicle = this.st.pkVehicle;
    // console.log(this.bodyAcceptOffer);
    await this.ui.onShowLoading('Enviando oferta...');

    this.offerSbc = this.services.onNewOffer( this.bodyAcceptOffer ).subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      await this.ui.onHideLoading();
      this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

      let msg = `${ this.st.nameComplete }, ha aceptado tu oferta de S/ ${ formatNumber( service.rateOffer, 'en', '.2-2' ) }`;
      if (service.changeRate === 1) {
        msg = `${ this.st.nameComplete }, acepta llevarte por S/ ${ formatNumber( service.rateOffer, 'en', '.2-2' ) }`;
      }
      this.bodyNoty.notificationTitle = `Nueva oferta`;
      this.bodyNoty.notificationSubTitle = `De ${ service.streetOrigin } hasta ${ service.streetDestination }`;
      this.bodyNoty.notificationMessage = msg;

      if (res.showError === 0 ) {

        const payloadService: IServices = service;
        payloadService.pkCategory = this.st.fkCategory;
        payloadService.aliasCategory = this.st.category;
        payloadService.codeCategory = this.st.codeCategory;
        payloadService.color = this.st.color;
        payloadService.numberPlate = this.st.numberPlate;
        payloadService.year = this.st.year;
        payloadService.nameBrand = this.st.brand;
        payloadService.nameModel = this.st.nameModel;
        payloadService.pkVehicle = this.st.pkVehicle;

        payloadService.nameComplete = this.st.dataUser.nameComplete;
        payloadService.document = this.st.dataUser.document;
        payloadService.prefix = this.st.dataUser.prefix;
        payloadService.nameCountry = this.st.dataUser.nameCountry;
        payloadService.img = this.st.dataUser.img;
        payloadService.fkDriver = this.st.dataUser.pkUser;
        payloadService.osId = this.st.osID;
        payloadService.changeRate = 0;

        this.st.onLoadVehicle().then( (val) => {

          this.io.onEmit('newOffer-driver', { pkClient: service.fkClient,
                                              dataOffer: payloadService }, (resSocket) => {
            console.log('Enviando nueva oferta socket', resSocket);
          });

        });

        this.dataServices = this.dataServices.filter( ts => ts.pkService !== service.pkService );
        this.onSendPush('Nueva oferta - llamataxi app', msg, osIdClient);
      }

    });

  }

  onGetError( showError: number ) {

    let arrErr = showError === 0 ? ['Oferta enviada con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr = ['Error', 'no se encontró servicio'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('servicio no disponible');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('servicio deshabilitado');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr = ['Error', 'no se encontró conductor'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErr.push('conductor pendiente de verificación');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrErr.push('conductor deshabilitado');
    }

    return arrErr.join(', ');

  }

  onSendPush( title: string, msg: string, osId: string ) {

    this.bodyPush.message = msg;
    this.bodyPush.title = title;
    this.bodyPush.osId = [osId];
    this.bodyPush.data = { url: 'offer-service' };

    this.osSbc = this.os.onSendPushUser( this.bodyPush ).subscribe( (res) => {
        console.log('push enviado con èxito', res);
    });

  }

  ngOnDestroy() {

    this.servicesSbc.unsubscribe();
    this.socketOfferSbc.unsubscribe();
    this.cancelSbc.unsubscribe();

    if (this.notySbc) {
      this.notySbc.unsubscribe();
    }

    if (this.offerSbc) {
      this.offerSbc.unsubscribe();
    }

    if (this.socketServicesSbc) {
      this.socketServicesSbc.unsubscribe();
    }

  }

}
