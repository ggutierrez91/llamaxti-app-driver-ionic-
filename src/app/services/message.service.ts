import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { MessageModel, ResponseModel } from '../models/message.model';
import { environment } from '../../environments/environment.prod';
import { IResApi } from '../interfaces/response-api.interface';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onAddMessage( body: MessageModel ) {
    // this.st.onLoadToken();
    return this.http.post<IResApi>( URI_API + `/Message/Add`, body, {headers: { Authorization: this.st.token }} );
  }

  onGetMessages( pkUser: number, page: number, rowsForPage = 5, showInactive = true) {
    // this.st.onLoadToken();
    const params = `?pkUser=${ pkUser }&page=${ page }&rowsForPage=${ rowsForPage }&showInactive=${ showInactive }`;
    return this.http.get<IResApi>( URI_API + `/Message/Get${ params }`, {headers: { Authorization: this.st.token }} );
  }

  onGetTotalMsg() {

    return this.http.get<IResApi>( URI_API + `/Message/Total`, {headers: { Authorization: this.st.token }} );

  }

  onGetResponseMsg( pkMessage: number, token = '' ) {
    return this.http.get<IResApi>( URI_API + `/Message/Get/Response/${ pkMessage }`, {headers: { Authorization: token }} );
  }

  onAddMsgRes( body: ResponseModel, token = '' ) {
    return this.http.post<IResApi>( URI_API + `/Message/Add/Response`, body, {headers: { Authorization: token }} );
  }
  
  onReadedMsg( pkMsg: number ) {
    return this.http.put<IResApi>( URI_API + `/Message/Readed/${ pkMsg }`, {}, {headers: { Authorization: this.st.token }} );
    
  }

}
