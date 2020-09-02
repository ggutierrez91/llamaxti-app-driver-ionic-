import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServiceRunPageRoutingModule } from './service-run-routing.module';

import { ServiceRunPage } from './service-run.page';
import { ComponentsModule } from '../../components/components.module';
import { ModalCalificationPageModule } from '../modal-calification/modal-calification.module';
import { ModalCalificationPage } from '../modal-calification/modal-calification.page';
import { PipesModule } from '../../pipes/pipes.module';
import { ModalChatPage } from '../modal-chat/modal-chat.page';
import { ModalChatPageModule } from '../modal-chat/modal-chat.module';

@NgModule({
  entryComponents:[
    ModalCalificationPage,
    ModalChatPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ComponentsModule,
    ServiceRunPageRoutingModule,
    ModalCalificationPageModule,
    ModalChatPageModule
  ],
  declarations: [ServiceRunPage]
})
export class ServiceRunPageModule {}
