import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessagePageRoutingModule } from './message-routing.module';

import { MessagePage } from './message.page';
import { ModalMessagePage } from '../modal-message/modal-message.page';
import { ModalMessagePageModule } from '../modal-message/modal-message.module';

@NgModule({
  
  entryComponents: [
    ModalMessagePage
  ],

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessagePageRoutingModule,
    ModalMessagePageModule
  ],
  declarations: [MessagePage]
})
export class MessagePageModule {}
