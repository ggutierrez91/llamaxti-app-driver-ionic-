import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisableAccountPageRoutingModule } from './disable-account-routing.module';

import { DisableAccountPage } from './disable-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisableAccountPageRoutingModule
  ],
  declarations: [DisableAccountPage]
})
export class DisableAccountPageModule {}
