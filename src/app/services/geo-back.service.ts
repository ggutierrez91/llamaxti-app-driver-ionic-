import { Injectable } from '@angular/core';
// import { BackgroundGeolocation,
//   BackgroundGeolocationConfig,
//   BackgroundGeolocationEvents,
//   BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';


@Injectable({
  providedIn: 'root'
})
export class GeoBackService {
  // private backgroundGeolocation: BackgroundGeolocation
  constructor(  ) { }
  /*
  onInitBackgGeo() {

    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 50,
      distanceFilter: 30,
      debug: true, //  emita sonidos cuando lanza un evento de localización
      stopOnTerminate: false, // habilite esto para borrar la configuración de ubicación de fondo cuando la aplicación finalice

    };

    this.backgroundGeolocation.configure(config)
    .then(() => {

      console.log('Background geo configurado con éxito');

    }).catch( e => console.error( 'Error al configurar background geo' ) );

  }

  onListenGeo() {

    return this.backgroundGeolocation.on(BackgroundGeolocationEvents.location);
      // .subscribe((location: BackgroundGeolocationResponse) => {

        // console.log(location);

        // IMPORTANTE: debe ejecutar el método de finalización aquí para informar al complemento nativo que ha terminado,
         // y se puede completar la tarea en segundo plano. Debe hacer esto independientemente de si sus operaciones tienen éxito o no.
         // SI NO LO HACE, ios CRASH SU APLICACIÓN por pasar demasiado tiempo en segundo plano.
        // this.backgroundGeolocation.finish(); // FOR IOS ONLY

      // });
  }

  onGeoStart() {

    // start recording location
    this.backgroundGeolocation.start();

  }

  onGeoStop() {

    // If you wish to turn OFF background-tracking, call the #stop method.
    this.backgroundGeolocation.stop();

  } */

}
