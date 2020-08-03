import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { PassModel } from '../../models/user.model';
import { StorageService } from '../../services/storage.service';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { IonSlides, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit, OnDestroy {
  @ViewChild('slideRestore', {static: true}) slideRestore: IonSlides;
  body: PassModel;

  userSbc: Subscription;

  // tslint:disable-next-line: max-line-length
  constructor( private st: StorageService, private ui: UiUtilitiesService, private userSvc: UserService, private navCtrl: NavController, private router: Router) { }

  ngOnInit() {
    this.slideRestore.lockSwipes(true);
    this.body = new PassModel();
    this.onLoadInit();
  }

  async onLoadInit() {
    await this.ui.onShowLoading('Espere...');
    this.st.onLoadToken().then( async() => {
      await this.ui.onHideLoading();
    });
  }

  async onChangePassword( frmPass: NgForm ) {
    await this.ui.onShowLoading('Guardando...');
    if (frmPass.valid) {
      this.userSbc = this.userSvc.onChangePass( this.body ).subscribe( async (res) => {
        if (!res.ok) {
          throw new Error( res.error );
        }

        await this.ui.onHideLoading();
        await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

        if (res.showError === 0 ) {
          await this.st.onSetItem('current-page', '/home', false);
          this.navCtrl.navigateRoot('/home');
        }

      });
    }

  }

  onGetError( showError: number ) {
    let arrErr = showError === 0 ? ['Se actualizó con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('no se encontró registro');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('pendiente de verificación');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('usuario inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr = ['Error', 'contraseña actual inválida'];
    }

    return arrErr.join(', ');
  }

  ngOnDestroy() {
    if (this.userSbc) {
      this.userSbc.unsubscribe();
    }
  }

}
