import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenCulquiModel, ClientCulquiModel, CardCulquiModel } from '../models/culqui.model';
import { ItokenCulqui, IClientCulqui, ICardCulqui } from '../interfaces/response-culqui.interface';
import { environment } from '../../environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class CulquiService {

  constructor(private http: HttpClient, private st: StorageService) { }

  onGetToken( apiKey: string, body: TokenCulquiModel ) {
    return this.http.post<ItokenCulqui>( '/v2/tokens', body, { headers: { Authorization: `Bearer ${ apiKey }` } } );
  }

  onAddClient( apiKey: string, body: ClientCulquiModel ) {
    return this.http.post<IClientCulqui>( '/v2/customers', body, { headers: { Authorization: `Bearer ${ apiKey }` } } );
  }

  onAddCard( apiKey: string, body: CardCulquiModel ) {
    return this.http.post<ICardCulqui>( '/v2/cards', body, { headers: { Authorization: `Bearer ${ apiKey }` } } );
  }

  onDeleteCard( apiKey: string, id: string) {

    return this.http.delete<ICardCulqui>( `/v2/cards/${id}`, { headers: { Authorization: `Bearer ${ apiKey }` } } );
  }

  onGetCulquiKey( token: string ) {

    this.st.onLoadToken();

    return this.http.get<IResApi>( URI_API + '/Culqui/Key', {headers: { Authorization: token }} );

  }
}
