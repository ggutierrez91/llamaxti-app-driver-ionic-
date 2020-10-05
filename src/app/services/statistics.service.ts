import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onGetWeek( ) {
      return this.http.get<IResApi>( URI_API + `/Statistics/Week`, { headers: { Authorization: this.st.token } } );
  }

  onGetDay( ) {
    return this.http.get<IResApi>( URI_API + `/Statistics/Day`, { headers: { Authorization: this.st.token } } );
  }

}
