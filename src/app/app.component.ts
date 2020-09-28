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
import { environment } from 'src/environments/environment';
import { HTTP } from '@ionic-native/http/ngx';

const URI_API = environment.URL_SERVER;

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
    private backgroundGeolocation: BackgroundGeolocation,
    private http: HTTP
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
          // activityType: 'OtherNavigation',
          // startOnBoot: false,

          // url: URI_API + `/Tracker/Geo`,
          // httpHeaders: { Authorization: this.apps.token },
          debug: false, //  enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: false // enable this to clear background location settings when the app terminates
        };

        this.backgroundGeolocation.configure(config).then(() => {

          this.backgroundGeolocation
            .on(BackgroundGeolocationEvents.location)
            .subscribe((location: BackgroundGeolocationResponse) => {
              console.log('nuevo track geo', location);
              // this.sendGPS(location);

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

  // sendGPS( location: BackgroundGeolocationResponse ) {

  //   const lat = location.latitude;
  //   const lng = location.longitude;

  //   const body = {
  //     lat,
  //     lng,
  //     run: this.apps.run,
  //     pkClient: this.apps.pkClient,
  //     distanceText: this.apps.distanceText,
  //     minutesText: this.apps.minutesText,
  //     distance: this.apps.distance,
  //     minutes: this.apps.minutes,
  //   };
  //   // this.http.setDataSerializer('json');
  //   this.http.setHeader('*', String( 'Authorization' ), String( this.apps.token ));
  //   this.http.setDataSerializer('json');
  //   this.http
  //     .post(
  //       URI_API + `/Tracker/Geo`, // backend api to post
  //       body,
  //       null
  //     )
  //     .then(data => {
  //       console.log(data);
  //       if (this.platform.is('ios')) {
  //         this.backgroundGeolocation.finish();
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error al enviar post racker', error);
  //       if (this.platform.is('ios')) {
  //         this.backgroundGeolocation.finish();
  //       }
  //     });
  // }

}
