import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AppUtilitiesService {

  arrPagesRoot: string[] = [ '/service-run', '/home' ];

  constructor(private st: Storage, private router: Router, private navCtrl: NavController) { }

  async onLoadCurrentPage() {
    const page: string = await this.st.get('current-page') || '/login';
    if ( !this.arrPagesRoot.includes(page) ) {
      this.router.navigateByUrl( page );
      return;
    }

    this.navCtrl.navigateRoot( page );
  }
}
