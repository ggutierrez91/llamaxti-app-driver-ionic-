import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactsPageRoutingModule } from './contacts-routing.module';

import { ContactsPage } from './contacts.page';
import { ModalContactPageModule } from '../modal-contact/modal-contact.module';
import { ModalContactPage } from '../modal-contact/modal-contact.page';

@NgModule({
  entryComponents: [ 
    ModalContactPage
  ],
  
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalContactPageModule,
    ContactsPageRoutingModule
  ],
  declarations: [ContactsPage]
})
export class ContactsPageModule {}
