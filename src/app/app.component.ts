import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SocketService } from './services/socket.service';
import { PushService } from './services/push.service';
import { AppUtilitiesService } from './services/app-utilities.service';
import { Howler} from 'howler';
// tslint:disable-next-line: max-line-length
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
import { retry } from 'rxjs/operators';

declare var window;
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
    private backgroundGeolocation: BackgroundGeolocation
  ) {
    this.io.onListenStatus();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      Howler.volume(1.0);

      this.apps.onLoadCurrentPage();
      this.os.onLoadConfig();

      this.apps.onLoadTokenTacker().then( (ok) => {

        const config: BackgroundGeolocationConfig = {
          desiredAccuracy: 10,
          stationaryRadius: 5,
          distanceFilter: 5,
          interval: 10000,
          activitiesInterval: 10000,
          debug: false,
          stopOnTerminate: false
        };

        this.backgroundGeolocation.configure(config).then(() => {

          this.backgroundGeolocation
            .on(BackgroundGeolocationEvents.location)
            .pipe( retry() )
            .subscribe((location: BackgroundGeolocationResponse) => {
              console.log('nuevo track geo', location);

              const body = {
                lat: location.latitude,
                lng: location.longitude,
                run: this.apps.run,
                pkClient: this.apps.pkClient,
                distanceText: this.apps.distanceText,
                minutesText: this.apps.minutesText,
                distance: this.apps.distance,
                minutes: this.apps.minutes,
              };

              this.apps.onAddTracker( body ).subscribe( (res) => {

                console.log('respuesta track node', res);

              });

            });
        });

        window.tracker = this;

      });

    });
  }

}
