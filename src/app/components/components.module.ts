import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { HeaderModalComponent } from './header-modal/header-modal.component';
import { IonicModule } from '@ionic/angular';
import { HeaderPageComponent } from './header-page/header-page.component';
import { FormInfoDriverComponent } from './form-info-driver/form-info-driver.component';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';

import { FormVehicleComponent } from './form-vehicle/form-vehicle.component';
import { FormVehicleTwoComponent } from './form-vehicle-two/form-vehicle-two.component';
import { MenuComponent } from './menu/menu.component';
import { FormDriverComponent } from './form-driver/FormDriverComponent';
import { PopoverHistoryComponent } from './popover-history/popover-history.component';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderModalComponent,
    HeaderPageComponent,
    FormInfoDriverComponent,
    FormDriverComponent,
    FormVehicleComponent,
    FormVehicleTwoComponent,
    PopoverHistoryComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    PipesModule,
  ],
  exports: [
    FooterComponent,
    HeaderModalComponent,
    HeaderPageComponent,
    FormInfoDriverComponent,
    FormDriverComponent,
    FormVehicleComponent,
    FormVehicleTwoComponent,
    PopoverHistoryComponent,
    MenuComponent
  ]
})
export class ComponentsModule { }
