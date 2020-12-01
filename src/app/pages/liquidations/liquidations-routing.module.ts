import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiquidationsPage } from './liquidations.page';

const routes: Routes = [
  {
    path: '',
    component: LiquidationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiquidationsPageRoutingModule {}
