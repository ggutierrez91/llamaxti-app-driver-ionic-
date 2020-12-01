import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JournalPageRoutingModule } from './journal-routing.module';

import { JournalPage } from './journal.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ModalPayJournalPage } from '../modal-pay-journal/modal-pay-journal.page';
import { ModalPayJournalPageModule } from '../modal-pay-journal/modal-pay-journal.module';

@NgModule({

  entryComponents: [
   ModalPayJournalPage
  ],

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ModalPayJournalPageModule,
    JournalPageRoutingModule
  ],
  declarations: [JournalPage]
})
export class JournalPageModule {}
