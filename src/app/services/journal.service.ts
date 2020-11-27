import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment.prod';
import { JournalModel } from '../models/journal.model';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetConf( ) {
    // this.st.onLoadToken();
    return this.http.get<IResApi>( URI_API + `/ConfigJournal`, {headers: { Authorization: this.st.token }} );
  }

  onAddJDriver( body: JournalModel ) {
    // this.st.onLoadToken();
    return this.http.post<IResApi>( URI_API + `/JournalDriver`, body, {headers: { Authorization: this.st.token }} );
  }

  onCloseJDriver( pk: number ) {
    // this.st.onLoadToken();
    return this.http.put<IResApi>( URI_API + `/JournalDriver/${ pk }`, {}, {headers: { Authorization: this.st.token }} );
  }

  onGetJournal( status: boolean ) {
    const params = `?status=${ status }`;
    return this.http.get<IResApi>( URI_API + `/JournalDriver${ params }`, {headers: { Authorization: this.st.token }} );
  }

}
