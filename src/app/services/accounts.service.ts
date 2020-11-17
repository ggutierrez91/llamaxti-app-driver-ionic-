import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { AccountModel } from '../models/account.model';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetBank() {
      return this.http.get<IResApi>( URI_API + `/Bank`, { headers: { Authorization: this.st.token } } );
  }

  onGetAccount() {
    return this.http.get<IResApi>( URI_API + `/Account`, { headers: { Authorization: this.st.token } } );
  }

  onAddAccount( body: AccountModel ) {
    return this.http.post<IResApi>( URI_API + `/Account`, body, { headers: { Authorization: this.st.token } } );
  }

  onDelAccount( pk: number, status = true ) {
    return this.http.delete<IResApi>( URI_API + `/Account/${ pk }/${ status }`, { headers: { Authorization: this.st.token } } );
  }

}
