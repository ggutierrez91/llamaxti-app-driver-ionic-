import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(private geo: Geolocation, private nativegeocoder: NativeGeocoder) { }

  onGetGeo() {
    return this.geo.getCurrentPosition();
  }

  onListenGeo() {
    return this.geo.watchPosition();
  }

  onGetStreet( lat: number, lng: number ) {
    return this.nativegeocoder.reverseGeocode(lat, lng, { useLocale: true, maxResults: 1 });
  }
}
