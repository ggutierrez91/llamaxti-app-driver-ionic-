import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { IChat } from '../../interfaces/chat.interface';
import { ChatFireService } from '../../services/chat-fire.service';
import { Subscription } from 'rxjs';
import {  IonContent, ModalController } from '@ionic/angular';
import { SocketService } from '../../services/socket.service';
import { IResSocket } from '../../interfaces/response-socket.interface';

@Component({
  selector: 'app-modal-chat',
  templateUrl: './modal-chat.page.html',
  styleUrls: ['./modal-chat.page.scss'],
})
export class ModalChatPage implements OnInit, OnDestroy {

  @ViewChild('driverChat', {static: true}) content: IonContent;

  @Input() pkService: number;
  @Input() pkUser: number;
  @Input() nameComplete: string;
  @Input() fkUserReceptor: number;

  chatSbc: Subscription;
  msg = '';
  loading = false;

  constructor( public cs: ChatFireService, private modalCtrl: ModalController, private io: SocketService ) { }

  ngOnInit() {
    this.onListenChat();
  }

  onListenChat() {
    this.chatSbc = this.cs.onLoadChat( this.pkService ).subscribe( () => {
      this.content.scrollToBottom(50);
    });
  }

  async onCloseModal() {
    await this.modalCtrl.dismiss({ ok: false }, 'close');
  }

  onSendMessage() {

    if (this.msg.length === 0) {
      return;
    }

    this.loading = true;
    this.cs.onAddSend( this.pkService, this.pkUser, this.msg, this.nameComplete ).then( (ok) => {
      this.content.scrollToBottom(50);
      this.msg = '';
      console.log('mensaje enviado exitosamente');

      this.io.onEmit('new-message-service', { pkUser: this.fkUserReceptor }, (res: IResSocket) => {
        console.log('emitiendo a cliente el envío de un nuevo mensaje', res);
      });

      this.loading = false;
    }).catch( (e) => console.log('Error al insertar mensaje a firebase') );
  }

  ngOnDestroy(){
    this.chatSbc.unsubscribe();
  }

}
