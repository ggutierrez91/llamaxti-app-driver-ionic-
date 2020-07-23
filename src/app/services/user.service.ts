import { Injectable } from '@angular/core';

import { StorageService } from './storage.service';
import { IResApi } from '../interfaces/response-api.interface';
import { IProfile } from '../interfaces/profile.interface';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetProfile() {
    return this.http.get<IResApi>( URI_API + `/Driver/Profile/App`, { headers: {Authorization: this.st.token} } ).pipe( retry(2) );
  }

  onUpdateProfi( body: IProfile, token: string ) {
    return this.http.post<IResApi>( URI_API + `/Driver/Profile/Update/App`, body, { headers: {Authorization: token} } );
  }

}
