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

@NgModule({
  entryComponents:[
    ModalCalificationPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ComponentsModule,
    ServiceRunPageRoutingModule,
    ModalCalificationPageModule
  ],
  declarations: [ServiceRunPage]
})
export class ServiceRunPageModule {}
