import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  public osID = '';
  constructor(private oneSignal: OneSignal, private st: StorageService, private http: HttpClient, private navCtrl: NavController ) { }

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

      if (osNoti.notification.data.accepted) {
        this.navCtrl.navigateRoot('/service-run', { animated: true } );
      }
    });

    this.oneSignal.endInit();

    this.oneSignal.getIds().then( async(info) => {
      this.osID = info.userId;
      await this.st.onSetItem('osID', info.userId);
    });

  }

  onSendPushUser( odId: string, title: string, msg: string, data = {} ) {
    const body = {
      app_id: environment.OS_APP ,
      // included_segments: ['Active Users', 'Inactive Users'],
      contents: { es: msg, en: 'Your have a new message' },
      headings: { es: title, en: 'Llamataxi app'  },
      data,
      include_player_ids: [ odId ]
    };
    return this.http.post( '/v1/notifications', body, {headers: { Authorization: `Basic ${ environment.OS_KEY }` }} );
  }

}
