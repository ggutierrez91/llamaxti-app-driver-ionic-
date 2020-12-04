import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConditionsPage } from './conditions.page';

const routes: Routes = [
  {
    path: '',
    component: ConditionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConditionsPageRoutingModule {}
