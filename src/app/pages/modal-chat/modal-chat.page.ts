import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IChat } from '../../interfaces/chat.interface';
import { ChatFireService } from '../../services/chat-fire.service';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-modal-chat',
  templateUrl: './modal-chat.page.html',
  styleUrls: ['./modal-chat.page.scss'],
})
export class ModalChatPage implements OnInit, OnDestroy {

  @Input() pkService: number;
  @Input() pkUser: number;
  @Input() nameComplete: string;

  chatSbc: Subscription;
  msg = '';
  loading = false;

  constructor( public cs: ChatFireService, private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.onListenChat();
  }

  onListenChat() {

    this.chatSbc = this.cs.onLoadChat( this.pkService ).subscribe();

  }

  onCloseModal() {
    this.alertCtrl.dismiss({ ok: false }, 'close');
  }

  onSendMessage() {

    if (this.msg.length === 0) {
      return;
    }

    this.loading = true;
    this.cs.onAddSend( this.pkService, this.pkUser, this.msg, this.nameComplete ).then( (ok) => {
      this.msg = '';
      console.log('mensaje enviado exitosamente');
      this.loading = false;
    }).catch( (e) => console.log('Error al insertar mensaje a firebase') );
  }

  ngOnDestroy(){
    this.chatSbc.unsubscribe();
  }

}
