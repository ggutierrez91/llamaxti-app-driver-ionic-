import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RestoreAccountPageRoutingModule } from './restore-account-routing.module';

import { RestoreAccountPage } from './restore-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RestoreAccountPageRoutingModule
  ],
  declarations: [RestoreAccountPage]
})
export class RestoreAccountPageModule {}
