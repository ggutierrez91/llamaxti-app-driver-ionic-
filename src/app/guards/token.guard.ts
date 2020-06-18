import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TokenGuard implements CanLoad {

  constructor(private storageSvc: StorageService , private navCtrl: NavController
    ) {}

  async canLoad(): Promise<boolean> {

    await this.storageSvc.onLoadToken();

    if (this.storageSvc.token === '') {
      this.navCtrl.navigateRoot('/login', { animated: true });
      return false;
    }
    return true;
  }
}
