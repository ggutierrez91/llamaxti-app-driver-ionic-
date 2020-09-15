import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SocketService } from './services/socket.service';
import { PushService } from './services/push.service';
import { AppUtilitiesService } from './services/app-utilities.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Howler} from 'howler';
import { GeoBackService } from './services/geo-back.service';
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
    private backgroundMode: BackgroundMode,
    private io: SocketService,
    private os: PushService,
    private apps: AppUtilitiesService,
    // private geoback: GeoBackService
    // tslint:disable-next-line: deprecation
  ) {
    this.io.onListenStatus();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      Howler.volume(1.0);

      // Habilite el modo de fondo. Una vez llamada,
      // evita que la aplicación se pause mientras está en segundo plano.
      this.backgroundMode.enable();

      this.apps.onLoadCurrentPage();
      this.os.onLoadConfig();
      // this.geoback.onInitBackgGeo();

    });
  }
}
