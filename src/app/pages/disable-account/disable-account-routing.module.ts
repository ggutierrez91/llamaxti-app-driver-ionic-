import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisableAccountPage } from './disable-account.page';

const routes: Routes = [
  {
    path: '',
    component: DisableAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisableAccountPageRoutingModule {}
