import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AppUtilitiesService {
  public token = '';
  public pkClient = 0;
  public run = false;
  public distanceText = '';
  public minutesText = '';
  public distance = 0;
  public minutes = 0;

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


  async onLoadTokenTacker() {

    this.token = await this.st.get('token') || '';
    this.distanceText = await this.st.get('distanceText') || '';
    this.minutesText = await this.st.get('minutesText') || '';
    this.pkClient =  Number( await this.st.get('pkClient') ) || 0;
    this.distance =  Number( await this.st.get('distance') ) || 0;
    this.minutes =  Number( await this.st.get('minutes') ) || 0;
    this.run = Boolean( await this.st.get('run') ) || false;

  }
}
