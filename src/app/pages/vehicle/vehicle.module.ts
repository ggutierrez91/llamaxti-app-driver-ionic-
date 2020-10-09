import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehiclePageRoutingModule } from './vehicle-routing.module';

import { VehiclePage } from './vehicle.page';
import { VehicleModalPage } from '../vehicle-modal/vehicle-modal.page';
import { VehicleModalPageModule } from '../vehicle-modal/vehicle-modal.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  entryComponents: [
    VehicleModalPage,
  ],
  // providers: [
  //   PipesModule
  // ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ComponentsModule,
    VehicleModalPageModule,
    VehiclePageRoutingModule
  ],
  declarations: [VehiclePage]
})
export class VehiclePageModule {}
