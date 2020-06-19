import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(public st: StorageService, private navCtrl: NavController) { }

  ngOnInit() {
    this.st.onLoadToken();
  }

  async onFinish() {
    await this.st.onClearStorage();
    this.navCtrl.navigateRoot('login', {animated: true});
  }

}
