import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { RestoreModel } from '../models/restore.model';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class RestoreService {

  constructor( private http: HttpClient ) { }

  onSendEmail( body: RestoreModel ) {
    return this.http.post<IResApi>( URI_API + `/Email/Restore`, body, { headers: { } } );
  }

}
