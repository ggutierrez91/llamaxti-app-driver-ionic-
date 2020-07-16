import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { ModalProfilePage } from '../modal-profile/modal-profile.page';
import { ModalProfilePageModule } from '../modal-profile/modal-profile.module';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  entryComponents: [
    ModalProfilePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ModalProfilePageModule,
    ComponentsModule,
    PipesModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
