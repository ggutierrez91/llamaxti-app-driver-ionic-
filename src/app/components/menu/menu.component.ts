import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/services/storage.service';
import { MessageService } from 'src/app/services/message.service';

const URI_SERVER = environment.URL_SERVER;
declare var window;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {

  totalSbc: Subscription;
  msgSbc: Subscription;
  readedSbc: Subscription;
  singSbc: Subscription;

  loading = false;
  loadingData = false;
  pathImg = URI_SERVER + '/User/Img/Get/';
  currentDate = moment();
  total = 0;
  // tslint:disable-next-line: max-line-length
  constructor(private navCtrl: NavController, public st: StorageService, private menuCtrl: MenuController, private router: Router, private ui: UiUtilitiesService, private zombie: Insomnia, private io: SocketService, private msgSvc: MessageService) { }

  ngOnInit() {
    this.onListenMsg();
    this.onListenReadedMsg();
    this.onListenSingSocket();
  }

  async onLogOut() {
    this.loading = true;
    await this.st.onClearStorage();
    this.menuCtrl.close();
    this.zombie.allowSleepAgain().then(
      (success) => {
        // this.loading = false;
        console.log('Teléfono puede volver a dormir x.x', success);
      },
      (e) => {
        // this.loading = false;
        console.log('Error al permitir bloqueo de pantalla', e);
      }
    );
    this.navCtrl.navigateRoot('/login').then( (ok) => {
      this.loading = false;

      if (this.st.playGeo) {
        window.tracker.backgroundGeolocation.stop();
      }

      this.io.onEmit('logout-user', {}, (ioRes: any) => {
        console.log('Desconectando usuario', ioRes);
      });
    });
  }

  async onRedirect( path: string ) {
    await this.ui.onShowLoading('Espere...');

    this.router.navigateByUrl( path ).then( async (ok) => {
      await this.ui.onHideLoading();
      // await this.st.onSetItem( 'current-page', path, false );
      this.menuCtrl.close();
    }).catch(e => {
      throw new Error( e );
    });
  }

  onGetTotal() {

    if (this.singSbc) {
      this.singSbc.unsubscribe();
    }

    this.totalSbc = this.msgSvc.onGetTotalMsg()
    .pipe( retry(3) )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.total = res.data.total;

    });
  }

  onListenMsg() {
    this.msgSbc = this.io.onListen('new-msg').pipe( retry(3) ).subscribe( (res) => {
      // console.log('new msg socket');
      this.total += 1;
    });
  }

  onListenReadedMsg() {
    this.readedSbc = this.io.onListen('readed-msg').pipe( retry(3) ).subscribe( (res) => {
      // console.log('new msg socket');

      if (this.total > 0) {
        this.total -= 1;
      }
    });
  }

  onListenSingSocket() {
    this.singSbc = this.io.onListen('sing-success').pipe( retry(3) ).subscribe( (res) => {
      // console.log('success sing socket', res);
      this.onGetTotal();
    });
  }

  ngOnDestroy() {

    if (this.totalSbc) {
      this.totalSbc.unsubscribe();
    }

    this.msgSbc.unsubscribe();
    this.readedSbc.unsubscribe();
  
    if (this.singSbc) {
      this.singSbc.unsubscribe();
    }

  }

}
