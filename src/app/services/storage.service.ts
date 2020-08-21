import { Injectable } from '@angular/core';
import { IResPromise } from '../interfaces/response-prom.interfaces';
import { Storage } from '@ionic/storage';
import { AuthService } from './auth.service';
import { IUserToken } from '../interfaces/user-token.interface';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public token = '';
  public dataUser: IUserToken = {
    pkUser: 0,
    pkPerson: 0,
    pkDriver: 0,
    role: '',
    userName: '',
    nameComplete: '',
    img: ''
  };
  public dataVehicle: any = null;
  public role = '';
  public pkDriver = 0;
  public pkUser = 0;
  public pkVehicle = 0;
  public fkCategory = 0;
  public category = '';
  public codeCategory = '';
  public brand = '';
  public nameModel = '';
  public numberPlate = '';
  public year = 0;
  public color = '';
  public imgTaxiFrontal = '';
  public nameComplete = '';
  public pkPerson = 0;
  public osID = '';
  public indexHex = '';
  public occupied = false;

  constructor( private storage: Storage, private authSvc: AuthService ) { }

  async onSaveCredentials( token: string, data: any ) {
      this.token = token;
      this.dataUser = data;
      this.pkDriver = data.pkDriver;
      this.role = data.role;
      this.nameComplete = data.nameComplete;
      this.pkPerson = data.pkPerson;
      this.pkUser = data.pkUser;

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

  async onLoadData() {
    const value = await this.storage.get( 'dataUser' );
    if (value) {
      this.dataUser =  JSON.parse( value );
      this.nameComplete = this.dataUser.nameComplete;
    }
  }

  async onLoadToken() {
    this.token = await this.storage.get('token') || '';
    this.osID = await this.storage.get('osID') || '';
    this.indexHex = await this.storage.get('indexHex') || '';
    this.occupied = await this.storage.get('occupied-driver') || false;
    const value = await this.storage.get( 'dataUser' );
    if (value) {
      this.dataUser =  JSON.parse( value );
      this.pkDriver = this.dataUser.pkDriver ;
      this.pkPerson = this.dataUser.pkPerson;
      this.pkUser = this.dataUser.pkUser;
      this.nameComplete = this.dataUser.nameComplete;
    }
  }

  async onLoadVehicle() {
    const value = await this.storage.get( 'dataVehicle' );
    if (value) {
      const dataJson = JSON.parse( value ) ;

      const dataVehicle = dataJson;
      this.pkVehicle = Number( dataVehicle.pkVehicle ) || 0;
      this.fkCategory = dataVehicle.pkCategory;
      this.category = dataVehicle.aliasCategory  || '';
      this.codeCategory = dataVehicle.codeCategory;
      this.brand = dataVehicle.nameBrand  || '';
      this.nameModel = dataVehicle.nameModel  || '';
      this.numberPlate = dataVehicle.numberPlate  || '';
      this.year = dataVehicle.year  || 0;
      this.color = dataVehicle.color  || '';
      this.imgTaxiFrontal = dataVehicle.imgTaxiFrontal || '';
      this.dataVehicle = dataVehicle || null;
    }
  }

  async onGetItem(name: string, isJson = false) {

    const value = await this.storage.get( name );
    return isJson ? JSON.parse( value ) : value ;

  }

  async onClearStorage() {
    this.token = '';
    await this.storage.set('token', null);
    // await this.storage.clear();
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
