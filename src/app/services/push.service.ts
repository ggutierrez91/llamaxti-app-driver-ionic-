import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { SocketService } from './socket.service';
import { PushModel } from '../models/push.model';
import { Router } from '@angular/router';

const URL_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class PushService {
  public osID = '';
  // tslint:disable-next-line: max-line-length
  constructor(private oneSignal: OneSignal, private st: StorageService, private http: HttpClient, private navCtrl: NavController , private io: SocketService, private router: Router) { }

  onLoadConfig() {
    // console.log('iniciando one signal');
    this.oneSignal.startInit('caa68993-c7a5-4a17-bebf-6963ba72519b', '514655229830');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe(async (osNoti) => {
     // do something when notification is received
    //  console.log('push recibida', osNoti);
      const declined = osNoti.payload.additionalData.declined || false;
      if (declined) {
        await this.st.onLoadToken();
        await this.st.onSetItem('current-page', '/home', false);
        await this.st.onSetItem('occupied-driver', false, false);
        await this.st.onSetItem('listenOffer', false, false);
        await this.st.onSetItem('runService', false, false);
        await this.st.onSetItem('current-service', null, false);
        await this.st.onSetItem('runDestination', false, false);
        await this.st.onSetItem('finishDestination', false, false);
        this.io.onEmit('occupied-driver', { occupied: false, pkUser: this.st.pkUser }, (resOccupied) => {
          console.log('Cambiando estado conductor', resOccupied);
        });
        this.navCtrl.navigateRoot('/home');
      }
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (osNoti) => {
      // do something when a notification is opened
      // console.log('push abierta', osNoti);
      const accepted = osNoti.notification.payload.additionalData.accepted || false;
      if (accepted) {
        await this.st.onSetItem('current-service', osNoti.notification.payload.additionalData.dataOffer, true);
        await this.st.onSetItem('occupied-driver', true, false);
        await this.st.onSetItem('runDestination', false, false);
        await this.st.onSetItem('finishDestination', false, false);

        // this.io. onEmit('occupied-driver', { occupied: true }, (resOccupied) => {
        //   console.log('Cambiando estado conductor', resOccupied);
        // });

        await this.st.onSetItem( 'current-page', '/service-run', false );
        this.navCtrl.navigateRoot('/service-run', { animated: true } );

      } else {

        // const declined = osNoti.notification.payload.additionalData.declined || false;
        const url = osNoti.notification.payload.additionalData.url || '';

        // if (declined) {
        //   await this.st.onSetItem('current-page', '/home', false);
        //   await this.st.onSetItem('current-service', null, false);
        //   await this.st.onSetItem('occupied-driver', false, false);
        //   await this.st.onSetItem('runDestination', false, false);
        //   await this.st.onSetItem('finishDestination', false, false);

        // }

        if (url !== '') {

          if (url === '/home') {
            return this.navCtrl.navigateRoot('/home', { animated: true } );
          } else {
            this.router.navigateByUrl( url );
          }

        }
      }
    });

    this.oneSignal.endInit();

    this.oneSignal.getIds().then( async (info) => {
      console.log('os id', info.userId);
      this.osID = info.userId;
      this.st.osID = info.userId;
      await this.st.onSetItem('osID', info.userId);
    });

  }

  async onGetId() {
    const info = await this.oneSignal.getIds();

    // console.log('os id', info.userId);
    this.osID = info.userId;
    this.st.osID = info.userId;
    await this.st.onSetItem('osID', info.userId);
  }

  onSendPushUser( body: PushModel ) {

    return this.http.post( URL_API + '/Push/Send', body, {headers: { Authorization: this.st.token }} );
  }

}
