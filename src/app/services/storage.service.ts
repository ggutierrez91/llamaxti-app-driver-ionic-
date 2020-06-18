import { Injectable } from '@angular/core';
import { IResPromise } from '../interfaces/response-prom.interfaces';
import { Storage } from '@ionic/storage';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public token = '';
  public dataUser: any = null;
  public role = '';
  public pkVehicle = 0;
  public fkCategory = 0;
  public category = '';
  public brand = '';
  public numberPlate = '';


  constructor( private storage: Storage, private authSvc: AuthService ) { }

  async onSaveCredentials( token: string, data: any ) {
      // console.log(data);
      this.token = token;
      this.dataUser = data;
      this.role = data.role;
      await this.storage.set('token', token);
      await this.storage.set('dataUser', JSON.stringify( data ));
      return true;
  }

  onSetItem( name: string, value: any, isJson = false ): Promise<IResPromise> {
    return new Promise( async ( resolve) => {
      await this.storage.set( name, isJson ? JSON.stringify( value ) : value );
      resolve({ ok: true });
    });
  }

  async onLoadToken() {
    this.token = await this.storage.get('token') || '';
    const value = await this.storage.get( 'dataUser' );
    this.dataUser =  JSON.parse( value );
  }

  async onGetItem(name: string, isJson = false) {

    const value = await this.storage.get( name );
    return isJson ? JSON.parse( value ) : value ;

  }

  async onClearStorage() {
    this.token = '';
    await this.storage.clear();
  }

  async onAuthToken(): Promise<IResPromise> {
    await this.onLoadToken();
    if (this.token === '') {
      return Promise.resolve({ok: false});
    }

    return new Promise( (resolve) => {
      this.authSvc.onAuth( this.token ).subscribe( async (res) => {
        if (!res.ok) {
          await this.onClearStorage();
          resolve({ok: false});
        }

        resolve({ok: true});
      });
    });
  }

}
