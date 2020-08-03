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
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/services-list/services-list.module').then( m => m.ServicesListPageModule)
  },
  {
    path: 'vehicle',
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/vehicle/vehicle.module').then( m => m.VehiclePageModule)
  },
  {
    path: 'welcome',
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'service-run',
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/service-run/service-run.module').then( m => m.ServiceRunPageModule)
  },
  {
    path: 'profile',
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'change-password',
    canLoad: [TokenGuard, AuthGuard],
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
