import { Injectable } from '@angular/core';
// import { BackgroundGeolocation,
//   BackgroundGeolocationConfig,
//   BackgroundGeolocationEvents,
//   BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
import { HTTP } from '@ionic-native/http/ngx';
// import { Platform } from '@ionic/angular';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import ITracker from '../interfaces/tracker.interface';
import { IResApi } from '../interfaces/response-api.interface';

const URI_SERVER = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class GeoBackService {
  runService = false;
  sbcTrack: Subscription;

  constructor(
    // private backgroundGeolocation: BackgroundGeolocation,
    private http: HttpClient
    // private platform: Platform
    ) { }

  // onInitBackgGeo( token = '', run = false ) {
  //   this.runService = run;
  //   const configTracker: BackgroundGeolocationConfig = {

  //     desiredAccuracy: 10, // Precisión deseada en metros.

  //     // tslint:disable-next-line: max-line-length
  //     stationaryRadius: 10, // Cuando se detiene, la distancia mínima que el dispositivo debe moverse más allá de la ubicación estacionaria para que se active.
  //     debug: true, //  emita sonidos cuando lanza un evento de localización

  //     stopOnTerminate: false

  //   };

  //   this.backgroundGeolocation.configure(configTracker).then(() => {

  //     this.backgroundGeolocation
  //       .on(BackgroundGeolocationEvents.location)
  //       .subscribe((location: BackgroundGeolocationResponse) => {
  //         console.log( 'nuevo track geo', location);


  //       });

  //   }).catch( e => console.error( 'Error al configurar background geo' ) );

  //   // Encienda el sistema de geolocalización en segundo plano. El usuario será rastreado cada vez que suspenda la aplicación.
  //   // this.backgroundGeolocation.start();

  // }

  sendGPS( body: ITracker, token = '' ) {


    const newLocal = `/Tracker/Geo`;
    return this.http
    .post<IResApi>( URI_SERVER + newLocal, body, {headers: { Authorization: token }} );
    // .subscribe( (res) => {

    //   console.log('response track post', res);
    //   if (this.platform.is('ios')) {
    //     this.backgroundGeolocation.finish();
    //   }

    // });

  }


  // onGeoStart() {
  //   this.backgroundGeolocation.start();

  // }

  // onGeoStop() {
  //   this.backgroundGeolocation.stop();
  // }


}
