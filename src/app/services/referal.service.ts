import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class ReferalService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetConfig() {
      return this.http.get<IResApi>( URI_API + `/ConfigRef/Amount`, { headers: { Authorization: this.st.token } } );
  }

}
