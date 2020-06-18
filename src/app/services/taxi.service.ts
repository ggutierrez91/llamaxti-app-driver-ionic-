import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { IResApi } from '../interfaces/response-api.interface';
import { ServiceModel } from '../models/service.model';

const URI_API = environment.URL_SERVER;
@Injectable({
  providedIn: 'root'
})
export class TaxiService {

  constructor(private http: HttpClient, private st: StorageService) { }

  onGetJournal() {
    this.st.onLoadToken();
    return this.http.get<IResApi>( URI_API + '/Journal/GetForHour', { headers: {Authorization: this.st.token} });
  }

  onGetRate() {
    this.st.onLoadToken();
    return this.http.get<IResApi>( URI_API + '/Rate/GetForJournal', { headers: {Authorization: this.st.token} });
  }

  onAddService(body: ServiceModel) {

    this.st.onLoadToken();
    return this.http.post<IResApi>( URI_API + '/Service/Add', body, { headers: {Authorization: this.st.token} });

  }

  onGetPercentRate() {

    this.st.onLoadToken();
    return this.http.get<IResApi>( URI_API + `/PercentRate`, { headers: {Authorization: this.st.token} } );

  }

  onGetServices( page: number ) {

    // this.st.onLoadToken();
    return this.http.get<IResApi>( URI_API + `/Services/Driver?page=${ page }`, { headers: {Authorization: this.st.token} } );

  }

  onGetTotalServices(  ) {

    return this.http.get<IResApi>( URI_API + `/Services/Driver/Total`, { headers: {Authorization: this.st.token} } );

  }

}
