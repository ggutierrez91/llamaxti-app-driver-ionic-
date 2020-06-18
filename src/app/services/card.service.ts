import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CardModel } from '../models/card.model';
import { IResApi } from '../interfaces/response-api.interface';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor( private http: HttpClient ) { }

  onAddCard( body: CardModel, token: string ) {
    return this.http.post<IResApi>( URI_API + '/Card/Add', body, { headers: {Authorization: token} } );
  }
}
