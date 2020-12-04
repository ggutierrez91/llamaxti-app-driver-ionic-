import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConditionsPageRoutingModule } from './conditions-routing.module';

import { ConditionsPage } from './conditions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConditionsPageRoutingModule
  ],
  declarations: [ConditionsPage]
})
export class ConditionsPageModule {}
