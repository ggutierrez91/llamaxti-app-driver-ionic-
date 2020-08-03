import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { NavController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { Insomnia } from '@ionic-native/insomnia/ngx';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  loading = false;
  loadingData = false;
  pathImg = URI_SERVER + '/User/Img/Get/';
  currentDate = moment();
  // tslint:disable-next-line: max-line-length
  constructor(private navCtrl: NavController, public st: StorageService, private menuCtrl: MenuController, private router: Router, private ui: UiUtilitiesService, private zombie: Insomnia) { }

  ngOnInit() {}

  async onLogOut() {
    this.loading = true;
    await this.st.onClearStorage();
    this.menuCtrl.close();
    this.zombie.allowSleepAgain().then(
      (success) => {
        this.loading = false;
        console.log('Teléfono puede volver a dormir x.x', success);
      },
      (e) => {
        this.loading = false;
        console.log('Error al permitir bloqueo de pantalla', e);
      }
    );
    this.navCtrl.navigateRoot('/login');
  }

  async onRedirect( path: string ) {
    await this.ui.onShowLoading('Espere...');
    
    this.router.navigateByUrl( path ).then( async (ok) => {
      await this.ui.onHideLoading();
      await this.st.onSetItem( 'current-page', path, false );
      this.menuCtrl.close();
    }).catch(e => {
      throw new Error( e );
    });
  }

}
