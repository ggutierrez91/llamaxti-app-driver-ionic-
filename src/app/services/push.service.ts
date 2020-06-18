import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  public osID = '';
  constructor(private oneSignal: OneSignal, private st: StorageService) { }

  onLoadConfig() {
    console.log('iniciando one signal');
    this.oneSignal.startInit('caa68993-c7a5-4a17-bebf-6963ba72519b', '514655229830');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe((osNoti) => {
     // do something when notification is received
     console.log('push recibida', osNoti);
    });

    this.oneSignal.handleNotificationOpened().subscribe((osNoti) => {
      // do something when a notification is opened
      console.log('push abierta', osNoti);
    });

    this.oneSignal.endInit();

    this.oneSignal.getIds().then( async(info) => {
      this.osID = info.userId;
      await this.st.onSetItem('osID', info.userId);
    });

  }

}
