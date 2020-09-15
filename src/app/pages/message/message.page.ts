import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { SocketService } from '../../services/socket.service';
import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';
import { retry, map } from 'rxjs/operators';
import { IMessage } from 'src/app/interfaces/message.interface';
import { environment } from '../../../environments/environment.prod';
import { ModalController, IonContent } from '@ionic/angular';
import { ModalMessagePage } from '../modal-message/modal-message.page';
import { UiUtilitiesService } from '../../services/ui-utilities.service';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit, OnDestroy {

  @ViewChild('contentMsg', {static: true}) content: IonContent;

  msgSbc: Subscription;
  readedSbc: Subscription;
  msgIOSbc: Subscription;
  responseIOSbc: Subscription;

  dataMsg: IMessage[] = [];

  pathImg = URI_SERVER + '/User/Img/Get/';
  sliceLength = 30;
  showMore = false;
  loading = false;

  // tslint:disable-next-line: max-line-length
  constructor(public st: StorageService, private io: SocketService, private msgSvc: MessageService, private modalCtrl: ModalController, private ui: UiUtilitiesService ) { }

  ngOnInit() {

    this.st.onLoadToken().then( (ok) => {

      this.onGetMessage( 1, this.st.pkUser );
      this.onListenMsg();
    }).catch( e => console.error('Error al cargar token') );

  }

  onListenMsg() {
    this.msgIOSbc = this.io.onListen('new-msg').pipe( retry(3) ).subscribe( (res: any) => {
      console.log('new msg socket', res);
      this.dataMsg.push( res.data );
      this.content.scrollToBottom(50);
    });
  }

  onGetMessage( page: number, pkUser = 0 ) {
    this.loading = true;
    this.msgSbc = this.msgSvc.onGetMessages( pkUser, page )
    .pipe(
      retry(),
      map( (value) => {
        console.log(value);
        const newData: IMessage[] = [];
        for (const msg of value.data) {
          newData.unshift(msg);
        }
        value.data = newData;
        return value;
      })
    )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataMsg = res.data;
      this.content.scrollToBottom(50);
      setTimeout(() => {
        this.loading = false;
      }, 3000);
      this.onListenNewResponse();
    });

  }

  async onShowDetail( msg: IMessage ) {

    await this.ui.onShowLoading('Espere...');
    this.onReadedMsg( msg.pkMessage );

    const modalMsg = await this.modalCtrl.create({
      component: ModalMessagePage,
      mode: 'ios',
      animated: true,
      componentProps: {
        token: this.st.token,
        data: msg
      }
    });

    modalMsg.present().then( async (ok) => {
      msg.totalResponseNoReaded = 0;
      await this.ui.onHideLoading();
    }).catch(e => console.error('error al abrir modal msg') );

    modalMsg.onDidDismiss().then( (val) => {

      if (val.data.ok) {
        const finded = this.dataMsg.find( dataMsg => dataMsg.pkMessage === msg.pkMessage );
        if (finded) {
          finded.totalResponses += val.data.totalSend;
        }
      }

    });
  }

  onListenNewResponse() {
    this.responseIOSbc = this.io.onListen('new-response-msg').subscribe( (res: any) => {
      const finded = this.dataMsg.find( msg => msg.pkMessage === Number( res.pkMessage ) );
      if (finded) {
        finded.totalResponseNoReaded += 1;
      }
    });
  }

  onReadedMsg( pk: number ) {

    if (this.readedSbc) {
      this.readedSbc.unsubscribe();
    }

    this.readedSbc = this.msgSvc.onReadedMsg( pk ).subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      if (res.showError === 1) {
        console.error('no se encontró mensaje');
      }

    });

  }

  ngOnDestroy() {
    console.log('destruyendo msg page');
    if (this.msgSbc) {
      this.msgSbc.unsubscribe();
    }

    if (this.readedSbc) {
      this.readedSbc.unsubscribe();
    }

    if (this.msgIOSbc) {
      this.msgIOSbc.unsubscribe();
    }

    if (this.responseIOSbc) {
      this.responseIOSbc.unsubscribe();
    }

  }

}
