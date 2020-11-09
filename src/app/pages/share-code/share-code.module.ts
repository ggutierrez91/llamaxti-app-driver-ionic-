import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShareCodePageRoutingModule } from './share-code-routing.module';

import { ShareCodePage } from './share-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareCodePageRoutingModule
  ],
  declarations: [ShareCodePage]
})
export class ShareCodePageModule {}
