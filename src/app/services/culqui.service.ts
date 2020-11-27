import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';
import { CardModel } from '../models/card.model';
import { RefundModel } from '../models/refund.model';
import { ChargeModel } from '../models/charge.model';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class CulquiService {

  constructor(private http: HttpClient, private st: StorageService) { }

  onGetToken( body: CardModel ) {
    return this.http.post<IResApi>( URI_API + '/Culqui/Token', body, { headers: { Authorization: this.st.token } } );
  }

  onAddCarge( body: ChargeModel ) {
    return this.http.post<IResApi>( URI_API + '/Culqui/Charge/Journal', body, { headers: { Authorization: this.st.token } } );
  }

  onAddRefund( body: RefundModel ) {
    return this.http.post<IResApi>( URI_API + '/Culqui/Refund', body, { headers: { Authorization: this.st.token } } );
  }
}
