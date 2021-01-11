import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IAccount } from 'src/app/interfaces/accounts.interface';
import { IBank } from 'src/app/interfaces/bank.interface';
import { AccountModel } from 'src/app/models/account.model';
import { AccountsService } from 'src/app/services/accounts.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import * as moment from 'moment';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit, OnDestroy {
  @ViewChild( IonSlides, {static: true} ) accountSlide: IonSlides;
  bankSbc: Subscription;
  addSbc: Subscription;
  delSbc: Subscription;
  listSbc: Subscription;

  dataBank: IBank[] = [];
  dataAccount: IAccount[] = [];

  body: AccountModel;
  pkDel = 0;
  statusDel = true;
  msgConfirm = 'eliminar';
  action = 'creó';
  loading = false;
  loadingList = false;
  // tslint:disable-next-line: max-line-length
  constructor( private st: StorageService, private ui: UiUtilitiesService, private accountSvc: AccountsService, private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.accountSlide.lockSwipes( true );
    this.body = new AccountModel();
    this.st.onLoadToken().then( () => {
      this.onLoadBank();
      this.onGetAccount();
    }).catch( e => console.error('Error al cargar token storage') );

  }

  onLoadBank() {

    this.bankSbc = this.accountSvc.onGetBank().subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataBank = res.data;

    });

  }

  onGetAccount() {
    this.loadingList = true;
    this.listSbc = this.accountSvc.onGetAccount().subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataAccount = res.data;
      this.loadingList = false;
    });
  }

  onDelAccount( pk: number ) {
    this.pkDel = pk;
    this.statusDel = false;
    this.msgConfirm = '¿Está seguro(a) de <b>eliminar</b> esta cuenta?';
    this.action = 'eliminó';
    this.onConfirmRestore();
  }

  async onConfirmRestore() {
    const confirmRestore = await this.alertCtrl.create({
      header: 'Mensaje al usuario',
      message: this.msgConfirm,
      mode: 'ios',
      translucent: true,
      buttons: [{
        text: 'No',
        cssClass: 'text-danger',
        handler: () => {}
      }, {
        text: 'Aceptar',
        handler: () => {
          this.onDeleteAccount();
        }
      }]
    });

    await confirmRestore.present();
  }

  async onDeleteAccount() {
    await this.ui.onShowLoading('Espere...');

    this.delSbc = this.accountSvc.onDelAccount( this.pkDel, this.statusDel )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onHideLoading();
      if (res.showError === 0) {
        
        this.dataAccount = this.dataAccount.filter( acc => acc.pkAccountDriver !== this.pkDel );

      }

      await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

    });

  }

  async onAddAccount( frm: NgForm ) {
    this.loading = true;
    this.action = 'creó';
    if (frm.valid) {
      await this.ui.onShowLoading('Espere...');

      this.addSbc = this.accountSvc.onAddAccount( this.body ).subscribe( async (res) => {

        if (!res.ok) {
          throw new Error( res.error );
        }
        this.loading = false;
        await this.ui.onHideLoading();

        // tslint:disable-next-line: no-bitwise
        if (res.showError & 16) {
          this.pkDel = res.data.pkAccount || 0;
          this.statusDel = true;
          this.msgConfirm = 'Desea restaurar su cuenta inactiva';
          this.action = 'restauró';
          this.onConfirmRestore();
        }

        if( res.showError === 0 ) {
          const finded = this.dataBank.find( bank => bank.pkBank === this.body.fkBank );
          if ( finded ) {
            this.dataAccount.unshift({
              pkAccountDriver: res.data.pkAccount || 0,
              ccAccount: this.body.ccAccount,
              cciAccount: this.body.cciAccount,
              fkBank: this.body.fkBank,
              bankName: finded.bankName,
              bankAlias: finded.bankAlias,
              dateRegister: moment().format( 'YYYY-MM-DD' )
            });
          }
          this.body.onReset();
        }

        await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

      });


    }

  }

  onGetError( showError: number ) {
    let arrErr = showError === 0 ? [`Se ${ this.action } una cuenta exitosamente`] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('no se encontró conductor');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('ya existe una cuenta');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('con este número');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr.push('con este número interbancario');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErr.push('se ecuentra inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrErr.push('no se encontró cuenta');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 64) {
      arrErr = ['Alerta', 'solo puede registrar un máximo de 02 cuentas'];
    }

    return arrErr.join(', ');

  }

  ngOnDestroy(): void {

    if (this.bankSbc) {
      this.bankSbc.unsubscribe();
    }

    if (this.addSbc) {
      this.addSbc.unsubscribe();
    }

    if (this.delSbc) {
      this.delSbc.unsubscribe();
    }

    if (this.listSbc) {
      this.listSbc.unsubscribe();
    }

  }

}
