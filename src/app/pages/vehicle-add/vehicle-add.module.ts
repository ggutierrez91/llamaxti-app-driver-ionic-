import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehicleAddPageRoutingModule } from './vehicle-add-routing.module';

import { VehicleAddPage } from './vehicle-add.page';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    VehicleAddPageRoutingModule
  ],
  declarations: [VehicleAddPage]
})
export class VehicleAddPageModule {}
