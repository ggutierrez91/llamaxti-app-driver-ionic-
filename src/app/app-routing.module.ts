import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TokenGuard } from './guards/token.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'singin',
    loadChildren: () => import('./pages/singin/singin.module').then( m => m.SinginPageModule)
  },
  {
    path: 'home',
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'services-list',
    loadChildren: () => import('./pages/services-list/services-list.module').then( m => m.ServicesListPageModule)
  },
  {
    path: 'vehicle',
    loadChildren: () => import('./pages/vehicle/vehicle.module').then( m => m.VehiclePageModule)
  },
  {
    path: 'vehicle-add',
    loadChildren: () => import('./pages/vehicle-add/vehicle-add.module').then( m => m.VehicleAddPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
