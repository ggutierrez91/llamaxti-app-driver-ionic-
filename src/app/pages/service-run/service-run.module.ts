import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServiceRunPageRoutingModule } from './service-run-routing.module';

import { ServiceRunPage } from './service-run.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiceRunPageRoutingModule
  ],
  declarations: [ServiceRunPage]
})
export class ServiceRunPageModule {}
