import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSlides, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { DisableAccountService } from 'src/app/services/disable-account.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';

@Component({
  selector: 'app-disable-account',
  templateUrl: './disable-account.page.html',
  styleUrls: ['./disable-account.page.scss'],
})
export class DisableAccountPage implements OnInit, OnDestroy {
  @ViewChild( IonSlides, {static: true} ) slideDisable: IonSlides;

  disableSbc: Subscription;

  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private ui: UiUtilitiesService, private disSvc: DisableAccountService, private navCtrl: NavController, private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.ui.onShowLoading('Espere...');
    this.slideDisable.lockSwipes( true );
    this.st.onLoadToken().then( () => {

      this.ui.onHideLoading();

    });

  }

  async onShowConfirm() {
    const confirmDisable = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Está seguro(a) de eliminar su cuenta?',
      mode: 'ios',
      buttons:[{
        text: 'Cerrar',
        cssClass: 'text-default',
        handler: () => {}
      }, {
        text: 'Eliminar',
        cssClass: 'text-danger',
        handler: () => {
          this.onDisableAccount();
        }
      }]
    });

    await confirmDisable.present();
  }

  onDisableAccount() {
    this.ui.onShowLoading( 'Eliminando...' );
    this.disableSbc = this.disSvc.onDisable().pipe( retry() ).subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onHideLoading();
      await this.ui.onShowToast( this.onGetError( res.showError ), 5000 );
      if (res.showError === 0) {
        await this.st.onClearStorage();
        await this.st.onSetItem('current-page', '/login', false);
        this.navCtrl.navigateRoot( '/login' ).then( () => {
          this.ui.onHideLoading();
        }).catch( e => console.error( 'Error al navegar al login', e ) );
      }

    });
  }

  onGetError( showError: number ) {
    const arrErr = showError === 0 ? ['Cuenta eliminada con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('no se encontró usuario');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('esta cuenta ya ha sido inhabilitada');
    }

    return arrErr.join(', ');

  }

  ngOnDestroy() {

    if (this.disableSbc) {
      this.disableSbc.unsubscribe();
    }
  }

}
