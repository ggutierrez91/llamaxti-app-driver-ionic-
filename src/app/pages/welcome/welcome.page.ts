import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { NavController } from '@ionic/angular';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { SocketService } from '../../services/socket.service';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(public st: StorageService, private navCtrl: NavController, private ui: UiUtilitiesService, private io: SocketService) { }

  ngOnInit() {
    this.st.onLoadToken();
  }

  async onFinish() {
    await this.ui.onShowLoading('Saliendo...');

    this.navCtrl.navigateRoot('login', {animated: true}).then( async() => {
      this.st.token = '';
      await this.st.onSetItem('token', null, false);
      await this.st.onSetItem( 'current-page', '/login', false );
      await this.ui.onHideLoading();
      this.io.onEmit('logout-user', {}, (ioRes: any) => {
        console.log('Desconectando usuario', ioRes);
      });
    });
  }

}
