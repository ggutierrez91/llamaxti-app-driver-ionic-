import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiquidationsPageRoutingModule } from './liquidations-routing.module';

import { LiquidationsPage } from './liquidations.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ModalInfoLiqPage } from '../modal-info-liq/modal-info-liq.page';
import { ModalInfoLiqPageModule } from '../modal-info-liq/modal-info-liq.module';

@NgModule({

  entryComponents: [
    ModalInfoLiqPage
  ],

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ModalInfoLiqPageModule,
    LiquidationsPageRoutingModule
  ],
  declarations: [LiquidationsPage]
})
export class LiquidationsPageModule {}
