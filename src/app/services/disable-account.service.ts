import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class DisableAccountService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onDisable() {
    return this.http.delete<IResApi>( URI_API + `/Disable/Account`, { headers: { Authorization: this.st.token } } );
  }

}
