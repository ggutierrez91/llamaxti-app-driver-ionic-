import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetHistory( page: number ) {
      return this.http.get<IResApi>( URI_API + `/History/Driver?page=${ page }`, { headers: { Authorization: this.st.token } } );
  }

  onGetDetailHistory( id: number ) {
    return this.http.get<IResApi>( URI_API + `/History/Detail/${ id }`, { headers: { Authorization: this.st.token } } );
  }
}
