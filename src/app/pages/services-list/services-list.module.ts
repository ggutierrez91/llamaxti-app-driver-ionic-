import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicesListPageRoutingModule } from './services-list-routing.module';

import { ServicesListPage } from './services-list.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ServicesListPageRoutingModule
  ],
  declarations: [ServicesListPage]
})
export class ServicesListPageModule {}
