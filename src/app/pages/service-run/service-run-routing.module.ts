import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServiceRunPage } from './service-run.page';

const routes: Routes = [
  {
    path: '',
    component: ServiceRunPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceRunPageRoutingModule {}
