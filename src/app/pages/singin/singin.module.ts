import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SinginPageRoutingModule } from './singin-routing.module';

import { SinginPage } from './singin.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

import { ModalConditionsPage } from '../modal-conditions/modal-conditions.page';
import { ModalConditionsPageModule } from '../modal-conditions/modal-conditions.module';

@NgModule({
  
  entryComponents: [
    ModalConditionsPage
  ],

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    ModalConditionsPageModule,
    SinginPageRoutingModule
  ],
  declarations: [SinginPage]
})
export class SinginPageModule {}
