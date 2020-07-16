import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { VehicleModel } from '../models/vehicle.model';
import { IResApi } from '../interfaces/response-api.interface';
import { StorageService } from './storage.service';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor( private http: HttpClient, private st: StorageService ) { }

  onAddVehicle( body: VehicleModel ) {
    return this.http.post<IResApi>( URI_API + `/Vehicle/Add/App`, body, {headers: { Authorization: this.st.token }} );
  }

  onUsingVehicle( pkVehicle: number ) {
    return this.http.put<IResApi>( URI_API + `/Using/Vehicle/${ pkVehicle }`, {}, {headers: { Authorization: this.st.token }} );
  }

  onGetUsing( pkDriver: number ) {
    return this.http.get<IResApi>( URI_API + `/Usin/Get/${ pkDriver }`, {headers: { Authorization: this.st.token }} );
  }
  
  onGetVehicle( pkDriver: number ) {
    return this.http.get<IResApi>( URI_API + `/Driver/Vehicle/Get/${ pkDriver }`, {headers: { Authorization: this.st.token }} );
  }

}
