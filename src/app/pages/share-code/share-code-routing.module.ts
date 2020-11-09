import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShareCodePage } from './share-code.page';

const routes: Routes = [
  {
    path: '',
    component: ShareCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShareCodePageRoutingModule {}
