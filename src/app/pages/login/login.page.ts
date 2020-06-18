import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { LoginModel } from '../../models/login.model';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { NavController, MenuController } from '@ionic/angular';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  bodyLogin: LoginModel;
  sbcLogin: Subscription;

  loading = false;
  // tslint:disable-next-line: max-line-length
  constructor( private authScv: AuthService, private storageSvc: StorageService, private uiSvc: UiUtilitiesService, private navCtrl: NavController, private menuCtrl: MenuController, private io: SocketService ) { }

  ngOnInit() {
    this.bodyLogin = new LoginModel();
    this.menuCtrl.swipeGesture(false);
  }

  onLogin(frm: NgForm) {

    if (frm.valid) {
      this.loading = true;
      this.sbcLogin = this.authScv.onLogin( this.bodyLogin ).subscribe( async (res) => {
        if (!res.ok) {
          throw new Error( res.error );
        }
        console.log(res);

        this.loading = false;
        if (res.showError !== 0) {
          this.uiSvc.onShowToast( this.onGetError( res.showError ), 2200 );
          await this.storageSvc.onClearStorage();
        } else {
          await this.storageSvc.onSaveCredentials( res.token, res.data );
          this.io.onSingUser().then( (resSocket) => {

            console.log('rol', this.storageSvc.role);
            this.navCtrl.navigateRoot('/home', {animated: true});
            // if (this.storageSvc.role === 'CLIENT_ROLE') {
            // } else {
            //   console.log('redireccionando conductor');
            //   this.navCtrl.navigateRoot('/homeDriver', {animated: true});
            // }

          }).catch( e => console.error('errror al configurar socket'));

        }


      });
    }
  }

  onGetError( showError: number ) {
    let arrErrors = showError === 0 ? [''] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErrors = ['Error', '(Usuario) o contraseña incorrectos'];
    }
    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErrors = ['Error', 'Usuario o (contraseña) incorrectos'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErrors.push( 'usuario pendiente de verificación' );
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErrors.push( 'usuario inactivo' );
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErrors.push( 'solo pueden acceder clientes y/o conductores' );
    }

    return arrErrors.join(', ');
  }

  ngOnDestroy() {
    if (this.sbcLogin) {
      this.sbcLogin.unsubscribe();
    }
    this.menuCtrl.swipeGesture(true);
  }

}
