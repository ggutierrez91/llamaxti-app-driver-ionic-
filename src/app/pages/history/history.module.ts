import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryPageRoutingModule } from './history-routing.module';

import { HistoryPage } from './history.page';
import { PipesModule } from '../../pipes/pipes.module';
import { ModalInfoServicePage } from '../modal-info-service/modal-info-service.page';
import { ModalInfoServicePageModule } from '../modal-info-service/modal-info-service.module';
import { ModalCalificationPage } from '../modal-calification/modal-calification.page';
import { ModalCalificationPageModule } from '../modal-calification/modal-calification.module';

@NgModule({

  entryComponents: [
    ModalInfoServicePage,
    ModalCalificationPage
  ],

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    HistoryPageRoutingModule,
    ModalInfoServicePageModule,
    ModalCalificationPageModule
  ],
  declarations: [HistoryPage]
})
export class HistoryPageModule {}
