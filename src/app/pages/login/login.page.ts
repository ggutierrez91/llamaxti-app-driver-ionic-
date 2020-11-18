import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginModel } from '../../models/login.model';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { NavController, MenuController } from '@ionic/angular';
import { SocketService } from '../../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  bodyLogin: LoginModel;
  sbcLogin: Subscription;

  loading = false;
  viewPass = false;
  typeInput = 'password';
  // tslint:disable-next-line: max-line-length
  constructor( private authScv: AuthService, private st: StorageService, private uiSvc: UiUtilitiesService, private navCtrl: NavController, private menuCtrl: MenuController, private io: SocketService, private router: Router) { }

  ngOnInit() {
    this.bodyLogin = new LoginModel();
    this.menuCtrl.swipeGesture(false);
    
    this.st.onGetItem('rememberMe').then( async (val) => {
      if (val) {
        this.bodyLogin.userName = await this.st.onGetItem('user') || '';
        this.bodyLogin.userPassword = await this.st.onGetItem('pass') || '';
      }
    }).catch( e => console.error('Error al extraer storage remember') );

  }

  onLogin(frm: NgForm) {

    if (frm.valid) {
      this.loading = true;
      this.sbcLogin = this.authScv.onLogin( this.bodyLogin )
      .pipe( retry() )
      .subscribe( async (res) => {
        if (!res.ok) {
          throw new Error( res.error );
        }

        if (res.showError !== 0) {
          this.loading = false;
          this.uiSvc.onShowToast( this.onGetError( res.showError ), 2200 );
          await this.st.onClearStorage();
        } else {

          if (this.bodyLogin.remenberMe) {
            await this.st.onSetItem('rememberMe', true, false);
            await this.st.onSetItem('pass', this.bodyLogin.userPassword, false);
            await this.st.onSetItem('user', this.bodyLogin.userName, false);
          }

          await this.st.onSaveCredentials( res.token, res.data );

          this.io.onSingUser().then( async (resSocket) => {
            console.log('configurando usuario socket', resSocket);

            this.io.onEmit('occupied-driver', {occupied: false, pkUser: res.data.pkUser}, (resOccupied) => {
              console.log('Cambiando estado conductor', resOccupied);
            });

            await this.st.onSetItem( 'current-page', '/home', false );
            this.navCtrl.navigateRoot('/home', {animated: true}).then( () => {
              this.loading = false;
            }).catch( e => console.error( 'error al redirigir al home', e ) );

          }).catch( e => console.error('errror al configurar socket', e));

        }

      });
    }
  }

  onGetError( showError: number ) {
    let arrErrors = showError === 0 ? [''] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErrors = ['Error', 'Usuario o contraseña incorrectos'];
    }
    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErrors = ['Error', 'Usuario o contraseña incorrectos'];
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

  onViewPassword() {
    this.viewPass = !this.viewPass;
    this.typeInput = this.viewPass ? 'text' : 'password';
  }

  async onNavSingin() {
    await this.uiSvc.onShowLoading('Espere...');
    // await this.st.onSetItem( 'current-page', '/singin', false );
    this.router.navigateByUrl('singin').then( async () => {
      await this.uiSvc.onHideLoading();
    }).catch(e => console.error('Error al navegar a crear cuenta', e) );
  }

  ngOnDestroy() {
    if (this.sbcLogin) {
      this.sbcLogin.unsubscribe();
    }
    this.menuCtrl.swipeGesture(true);
  }

}
