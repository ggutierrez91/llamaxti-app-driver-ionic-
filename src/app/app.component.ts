import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SocketService } from './services/socket.service';
import { PushService } from './services/push.service';
import { AppUtilitiesService } from './services/app-utilities.service';
import { Globalization } from '@ionic-native/globalization/ngx';
import { Howler} from 'howler';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private io: SocketService,
    private os: PushService,
    private apps: AppUtilitiesService,
    // tslint:disable-next-line: deprecation
    private global: Globalization
  ) {
    this.initializeApp();
    this.io.onListenStatus();
  }

  initializeApp() {
    Howler.volume(1.0);
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.apps.onLoadCurrentPage();
      // this.apps.onLoadCurrentPage();
      this.os.onLoadConfig();
      this.global.getLocaleName().then(
        (setting) => { console.log('Idioma del dispositivo', setting.value); },
        (e) => { console.error('Error al detectar idioma'); }
       );
    });
  }
}
