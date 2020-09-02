import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactModel } from '../models/contact.model';
import { IResApi } from '../interfaces/response-api.interface';
import { environment } from '../../environments/environment.prod';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;
@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onAddContact( body: ContactModel, token: string ) {
      return this.http.post<IResApi>( URI_API + '/Contact/Add', body, { headers: { Authorization: token } } );
  }

  onUpdateContact( body: ContactModel, token: string ) {
      return this.http.put<IResApi>( URI_API + '/Contact/Update', body, { headers: { Authorization: token } } );
  }

  onDelContact( pkContact: number, status: boolean, token = '' ) {
    if (token !== '') {
      this.st.token = token;
    }
    return this.http.delete<IResApi>( URI_API + `/Contact/${ pkContact }/${ status }`, { headers: { Authorization: this.st.token } } );
  }

  onGetContact( ) {
      return this.http.get<IResApi>( URI_API + `/Contact/Get`, { headers: { Authorization: this.st.token } } );
  }
}
