import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicesListPage } from './services-list.page';

const routes: Routes = [
  {
    path: '',
    component: ServicesListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesListPageRoutingModule {}
