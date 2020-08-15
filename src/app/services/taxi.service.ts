import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { IResApi } from '../interfaces/response-api.interface';
import { ServiceModel } from '../models/service.model';
import { OfferModel } from '../models/offer.model';
import { CalificationModel } from '../models/calification.model';

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

  onGetDemand() {
    return this.http.get<IResApi>( URI_API + `/Demand`, { headers: {Authorization: this.st.token} } );
  }

  onNewOffer( body: OfferModel ) {
    return this.http.post<IResApi>( URI_API + `/Service/NewOffer`, body, { headers: {Authorization: this.st.token} } );
  }

  onAcceptOffer( body: OfferModel ) {
    return this.http.post<IResApi>( URI_API + `/Service/AcceptOffer`, body, { headers: { Authorization: this.st.token } } );
  }

  onServiceInfo( pkService: number ) {
    return this.http.put<IResApi>( URI_API + `/Service/Info/${ pkService }`,{}, { headers: {Authorization: this.st.token} } );
  }

  onDeclineOffer( body: any ) {
    return this.http.post<IResApi>( URI_API + `/Offer/Decline`, body, { headers: {Authorization: this.st.token} } );
  }

  onCalification( pkService: number, body: CalificationModel, token: string ) {
    return this.http.put<IResApi>( URI_API + `/Service/Calification/${ pkService }`, body, { headers: {Authorization: token} } );
  }

  onDeleteRun( pkService: number, isClient: boolean ) {
    // tslint:disable-next-line: max-line-length
    return this.http.put<IResApi>( URI_API + `/Service/DeleteRun/${ pkService }/${ isClient }`, {}, { headers: {Authorization: this.st.token} } );
  }

}
