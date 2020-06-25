import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NotyModel } from '../models/notify.model';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient, private st: StorageService) { }

  onAddNotify( body: NotyModel ) {
    return this.http.post<IResApi>( URI_API + `/Notification/Add`, body, { headers: {Authorization: this.st.token} } );
  }

  onReadNotify( id: number ) {
    return this.http.put<IResApi>( URI_API + `/Notification/Readed/${ id }`, { headers: {Authorization: this.st.token} } );
  }

  onGetNotify() {
    return this.http.get<IResApi>( URI_API + `/Notification/Get/Receptor`, { headers: {Authorization: this.st.token} } );
  }

}
