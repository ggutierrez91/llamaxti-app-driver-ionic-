import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IMessage } from '../../interfaces/message.interface';
import { environment } from '../../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { retry } from 'rxjs/operators';
import { ResponseModel } from '../../models/message.model';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import * as moment from 'moment';
import { NotyModel } from '../../models/notify.model';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.page.html',
  styleUrls: ['./modal-message.page.scss'],
})
export class ModalMessagePage implements OnInit, OnDestroy {

  @Input() data: IMessage;
  @Input() token: string;

  responseSbc: Subscription;
  sendSbc: Subscription;
  notySbc: Subscription;

  pathImg = URI_SERVER + '/User/Img/Get/';
  tokenPath = '';

  responses: IMessage[] = [];

  showResponse = false;
  loading = false;

  bodyResponse: ResponseModel;
  bodyNotify: NotyModel;
  sendResponse = 0;

  // tslint:disable-next-line: max-line-length
  constructor( private modalCtrl: ModalController, private msgSvc: MessageService, private ui: UiUtilitiesService, private st: StorageService, private notySvc: NotificationService, private io: SocketService ) { }

  ngOnInit() {
    this.tokenPath = `?token=${ this.token }`;
    console.log(this.data);
    this.st.onLoadToken().then( (ok) => {
      
      this.bodyResponse = new ResponseModel( this.data.pkMessage, this.data.fkUserEmisor );
      this.bodyNotify = new NotyModel( `/admin/profileDriver/${ this.st.pkDriver }`, this.st.pkUser );
      this.bodyNotify.fkUserReceptor = this.data.fkUserEmisor;

    }).catch( e => console.error('Error al cargar storage', e) );

    this.onGetResponses();
  }

  onGetResponses() {
    this.responseSbc = this.msgSvc.onGetResponseMsg( this.data.pkMessage, this.token )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.responses = res.data;

    });
  }

  onSendResponse() {

    if (this.bodyResponse.message.length === 0) {
      return false;
    }

    this.loading = true;

    this.sendSbc = this.msgSvc.onAddMsgRes( this.bodyResponse, this.token )
    // .pipe( retry(3) )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );
      this.loading = false;
      if (res.showError === 0) {

        this.io.onEmit('new-response-to-panel', { pkMessage: this.bodyResponse.pkMessage }, (resIO) => {
          console.log('emit socket new response', resIO);
        });

        this.responses.push({
          pkMessage: this.bodyResponse.pkMessage,
          message: this.bodyResponse.message,
          dateRegister: moment().format(),
          fkUserEmisor: this.data.fkUserEmisor,
          fkUserReceptor: this.data.fkUserReceptor,
          imgEmisor: this.data.imgEmisor,
          imgReceptor: this.data.imgReceptor,
          nameEmisor: this.data.nameEmisor,
          nameReceptor: this.data.nameReceptor,
          subject: '',
          totalResponses: 0,
          userEmisor: ''
        });
        this.bodyResponse.message = '';
        this.sendResponse += 1;

        this.onSendNotify();

      }

    });
  }

  onSendNotify() {

    this.bodyNotify.notificationTitle = 'Nueva respuesta';
    this.bodyNotify.notificationSubTitle = 'Conductor app';
    this.bodyNotify.notificationMessage = `El conductor ha enviado una nueva respuesta`;

    const payload = {
      title: 'Nueva respuesta',
      subtitle: 'Conductor app',
      message: this.bodyNotify.notificationMessage,
      urlShow: this.bodyNotify.urlShow
    };

    this.io.onEmit('send-notification-web', payload, (resSocket: any) => {
      console.log('respuesta socket', resSocket);
    });

  }

  onGetError( showError: number ) {
    const arrError = showError === 0 ? ['Respuesta enviada con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if ( showError & 1 ) {
      arrError.push('mensaje no encontrado');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 2 ) {
      arrError.push('emisor no existe');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 4 ) {
      arrError.push('emisor inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 8 ) {
      arrError.push('receptor no existe');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 16 ) {
      arrError.push('receptor inactivo');
    }

    return arrError.join(', ');

  }

  onCloseModal() {
    this.modalCtrl.dismiss({ ok: true, totalSend: this.sendResponse }, 'close');
  }

  ngOnDestroy() {
    this.responseSbc.unsubscribe();
  }

}
