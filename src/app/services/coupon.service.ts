import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetCoupon( status: string ) {
      return this.http.get<IResApi>( URI_API + `/Coupon/User?status=${ status }`, { headers: { Authorization: this.st.token } } );
  }

  onAddCoupon( code: string ) {
    return this.http.put<IResApi>( URI_API + `/Coupon/Valid/${ code }`, {}, { headers: { Authorization: this.st.token } } );
  }

}
