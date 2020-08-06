import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IResApi } from '../interfaces/response-api.interface';
import { UserModel } from '../models/user.model';
import { LoginModel } from '../models/login.model';
import { DriverModel } from '../models/user-driver.model';

const URI_API = environment.URL_SERVER;
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient ) { }

  onLogin( body: LoginModel ) {
    return this.http.post<IResApi>( URI_API + '/Login/Driver', body, {} );
  }

  onGetNationality( query = '' ) {
    return this.http.get<IResApi>( URI_API + `/nationality/GetAll?qCountry=${ query }` );
  }

  onGetTypeDocument() {
    return this.http.get<IResApi>(URI_API + `/typeDocument/GetAll`);
  }

  onReniecDni( dni: string ) {
    return this.http.get( URI_API +  `/dni?q=${ dni }`);
  }

  onSaveClient( body: UserModel ) {
    return this.http.post<IResApi>(URI_API + `/singin/user`, body, {});
  }
  
  onSaveDriver( body: DriverModel ) {
    return this.http.post<IResApi>( URI_API + `/singin/driver`, body, {} );
  }

  onAuth( token: string ) {
    return this.http.post<IResApi>(URI_API + '/authorization', {}, { headers: {Authorization: token} });
  }
}
