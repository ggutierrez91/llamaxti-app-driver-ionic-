import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class LiquidationsService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetLiq( page: number ) {
      return this.http.get<IResApi>( URI_API + `/Liquidation/Driver?page=${ page }`, { headers: { Authorization: this.st.token } } );
  }

  onGetInfoLiq( pkLiqu: number ) {
    return this.http.get<IResApi>( URI_API + `/Liquidation/info?pkLiqu=${ pkLiqu }`, { headers: { Authorization: this.st.token } } );
  }

}
