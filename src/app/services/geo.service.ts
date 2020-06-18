import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable } from 'rxjs';
import { NativeGeocoder, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(private geo: Geolocation, private nativegeocoder: NativeGeocoder) { }

  onGetGeo(): Promise<Geoposition> {
    return this.geo.getCurrentPosition();
  }

  onListenGeo(): Observable<Geoposition> {
    return this.geo.watchPosition();
  }

  onGetStreet( lat: number, lng: number ) {
    return this.nativegeocoder.reverseGeocode(lat, lng, { useLocale: true, maxResults: 1 });
  }
}
