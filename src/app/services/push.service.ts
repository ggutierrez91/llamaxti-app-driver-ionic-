import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { PushModel } from '../models/push.model';
import { Howl, Howler} from 'howler';
const URL_API = environment.URL_SERVER;
import { Socket } from 'ngx-socket-io';


@Injectable({
  providedIn: 'root'
})
export class PushService {
  public osID = '';
  // tslint:disable-next-line: max-line-length
  constructor(private oneSignal: OneSignal, private st: StorageService, private http: HttpClient, private navCtrl: NavController , private socket: Socket) { }

  onLoadConfig() {
    // console.log('iniciando one signal');
    this.oneSignal.startInit( environment.OS_APP , environment.OS_KEY);

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe(async (osNoti) => {
     // do something when notification is received
    //  console.log('push recibida', osNoti);
      const accepted = osNoti.payload.additionalData.accepted || false;
      const declined = osNoti.payload.additionalData.declined || false;

      // await this.st.onSetItem('runDestination', false, false);
      // await this.st.onSetItem('finishDestination', false, false);

      await this.st.onLoadToken();
      let occupied = false;
      if (declined) {
        await this.st.onSetItem('current-page', '/home', false);
        await this.st.onSetItem('listenOffer', false, false);
        await this.st.onSetItem('current-service', null, false);
        this.navCtrl.navigateRoot('/home' );

      }

      if (accepted) {
        occupied = true;
        await this.st.onSetItem('current-service', osNoti.payload.additionalData.dataOffer, true);
        await this.st.onSetItem('listenOffer', true, false);
        await this.st.onSetItem( 'current-page', '/service-run', false );
        this.navCtrl.navigateRoot('/service-run');
      }
      this.st.occupied = occupied;
      // await this.st.onSetItem('occupied-driver', occupied, false);
      this.onLoadSound();

      // this.io.onEmit('occupied-driver', { occupied, pkUser: this.st.pkUser }, (resOccupied) => {
      //   console.log('Cambiando estado conductor', resOccupied);
      // });
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (osNoti) => {
      // do something when a notification is opened
      // console.log('push abierta', osNoti);
      const accepted = osNoti.notification.payload.additionalData.accepted || false;
      const declined = Boolean( osNoti.notification.payload.additionalData.declined ) || false;
      if (accepted) {
        this.navCtrl.navigateRoot('/service-run' );
      }

      if (declined) {
        this.navCtrl.navigateRoot('/home');
      }

    });

    this.oneSignal.endInit();

    this.oneSignal.getIds().then( async (info) => {

      const newId = `${ info.userId }-driver`;
      console.log('os id', newId);
      this.oneSignal.setExternalUserId( newId );
      this.osID = newId;
      this.st.osID = newId;
      this.socket.emit( 'config-osID', { osId: newId }, (resIO: any) => {
        console.log('config osid socket');
      });
      await this.st.onSetItem('osID', newId);

    });

  }

  onSendPushUser( body: PushModel ) {

    return this.http.post( URL_API + '/Push/Send', body, {headers: { Authorization: this.st.token }} );
  }

  onLoadSound() {

    // Setup the new Howl.
    const sound = new Howl({
      src: ['./assets/iphone-noti.mp3']
    });

    // Play the sound.
    sound.play();

  }

}
