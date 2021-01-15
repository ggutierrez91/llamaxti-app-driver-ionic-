import { Injectable } from '@angular/core';
import { IResPromise } from '../interfaces/response-prom.interfaces';
import { Storage } from '@ionic/storage';
import { AuthService } from './auth.service';
import { IUserToken } from '../interfaces/user-token.interface';
import * as moment from 'moment';
import { ICard, ItokenCulqui } from '../interfaces/culqui.interface';
import { CardModel } from '../models/card.model';
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
    img: '',
    codeReferal: ''
  };

  public cardsCulqui: ICard[] = [];

  public dataJournal = {
    pkJournalDriver: 0,
    nameJournal: '',
    modeJournal: '',
    codeJournal: '',
    rateJournal: 0,
    dateStart: '',
    expired: false
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
  public name = '';
  public pkPerson = 0;
  public osID = '';
  public indexHex = '';
  public occupied = false;
  public playGeo = false;
  public pkService = 0;

  constructor( private st: Storage, private authSvc: AuthService ) { }

  async onSaveCredentials( token: string, data: any ) {
      this.token = token;
      this.dataUser = data;
      this.pkDriver = data.pkDriver;
      this.role = data.role;
      this.nameComplete = data.nameComplete;
      this.name = data.name;
      this.pkPerson = data.pkPerson;
      this.pkUser = data.pkUser;

      this.dataJournal.pkJournalDriver = data.pkJournalDriver;
      this.dataJournal.codeJournal = data.codeJournal;
      this.dataJournal.nameJournal = data.nameJournal;
      this.dataJournal.modeJournal = data.modeJournal;
      this.dataJournal.rateJournal = data.rateJournal;
      this.dataJournal.dateStart = data.dateStart;
      // this.dataJournal.dateStart = data.dateStart;

      await this.st.set('tokenDriver', token);
      await this.st.set('dataUser', JSON.stringify( data ));
      await this.st.set('dataJournal', JSON.stringify( this.dataJournal ));
      return true;
  }

  onSetItem( name: string, value: any, isJson = false ): Promise<IResPromise> {
    return new Promise( async ( resolve) => {
      await this.st.set( name, isJson ? JSON.stringify( value ) : value );
      resolve({ ok: true });
    });
  }

  async onLoadData() {
    const value = await this.st.get( 'dataUser' );
    if (value) {
      this.dataUser =  JSON.parse( value );
      this.name = this.dataUser.name;
      this.nameComplete = this.dataUser.nameComplete;
    }
  }

  async onLoadJournal() {

    const value = await this.st.get( 'dataJournal' );
    if (value) {
      const data =  JSON.parse( value );
      this.dataJournal.pkJournalDriver = data.pkJournalDriver;
      this.dataJournal.codeJournal = data.codeJournal;
      this.dataJournal.nameJournal = data.nameJournal;
      this.dataJournal.modeJournal = data.modeJournal;
      this.dataJournal.rateJournal = data.rateJournal;
      this.dataJournal.dateStart = data.dateStart;

      let startDate = moment( data.dateStart ).add(24, 'hours');
      const current = moment();

      if (this.dataJournal.modeJournal === 'FORTODAY') {
        // console.log('diferencia horas', startDate.diff( current, 'minutes' ));
        this.dataJournal.expired = startDate.diff( current, 'minutes' ) > 0 ? false : true;
      } else {
        const auxStar = moment( data.dateStart );
        startDate = moment( `${ auxStar.format('yyyy/MM/DD') } 23:59` );
        
        console.log('f exp', startDate);
        console.log('diferencia minutos', startDate.diff( current, 'minutes' ));
        this.dataJournal.expired = startDate.diff( current, 'minutes' ) > 0 ? false : true;
      }

    }

  }

  async onLoadToken() {
    this.token = await this.st.get('tokenDriver') || 'xD';
    this.osID = await this.st.get('osID') || '';
    // this.indexHex = await this.st.get('indexHex') || '';
    this.occupied = await this.st.get('occupied-driver') || false;
    this.playGeo =  Boolean( await this.st.get('playGeo') ) || false;
    const value = await this.st.get( 'dataUser' );
    if (value) {
      this.dataUser =  JSON.parse( value );
      this.pkDriver = this.dataUser.pkDriver ;
      this.pkPerson = this.dataUser.pkPerson;
      this.pkUser = this.dataUser.pkUser;
      this.nameComplete = this.dataUser.nameComplete;
      this.name = this.dataUser.name;
    }
  }

  async onLoadVehicle() {
    const value = await this.st.get( 'dataVehicle' );
    if (value) {
      const dataJson = JSON.parse( value ) ;
      console.log('data vehicle', dataJson);
      const dataVehicle = dataJson;
      this.pkVehicle = Number( dataVehicle.pkVehicle ) || 0;
      this.fkCategory = dataVehicle.pkCategory;
      this.category = dataVehicle.nameCategory  || '';
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

    const value = await this.st.get( name );
    return isJson ? JSON.parse( value ) : value ;

  }

  
  async onSaveCard( data: ItokenCulqui, body: CardModel ) {
    this.cardsCulqui.unshift({
      token: data.id,
      card_number: data.card_number,
      cvv: body.cvv,
      expiration_year: body.expiration_year,
      expiration_month: body.expiration_month,
      email: body.email,
      cardAll: body.card_number,
      expiration: body.expiration,
      card_brand: data.iin.card_brand,
      card_category: data.iin.card_category,
      card_type: data.iin.card_type,
      bank: data.iin.issuer.name,
      card_last_foru: data.last_four,
      pkUser: this.pkUser
    });
    await this.st.set('cardsCulqui', JSON.stringify( this.cardsCulqui ) );
  }

  async onLoadCards() {
    const data = await this.st.get( 'cardsCulqui' );
    if (data) {

      const cardsTemp: ICard[] = JSON.parse( data );

      this.cardsCulqui = cardsTemp.filter( rec => rec.pkUser === this.pkUser );
    }
  }

  async onClearStorage() {
    this.token = '';
    this.playGeo = false;
    this.pkVehicle = 0;
    this.dataUser = {
      pkUser: 0,
      pkPerson: 0,
      pkDriver: 0,
      role: '',
      userName: '',
      nameComplete: '',
      img: '',
      codeReferal: ''
    };
    this.dataJournal = {
      pkJournalDriver: 0,
      nameJournal: '',
      modeJournal: '',
      codeJournal: '',
      rateJournal: 0,
      dateStart: '',
      expired: false
    };
    await this.st.set('tokenDriver', null);
    await this.st.set('playGeo', false);
    await this.st.set( 'dataVehicle', null);
    await this.st.set( 'dataUser', null);
    await this.st.set( 'dataJournal', null);
    await this.st.set( 'current-service', null);

    // await this.st.clear();
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
