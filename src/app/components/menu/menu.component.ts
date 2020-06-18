import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { NavController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  loading = false;
  constructor(private navCtrl: NavController, private st: StorageService, private menuCtrl: MenuController, private router: Router) { }

  ngOnInit() {}

  async onLogOut() {
    this.loading = true;
    await this.st.onClearStorage();
    this.loading = false;
    this.menuCtrl.close();
    this.navCtrl.navigateRoot('/login');

  }

  onRedirect( path: string ) {
    this.router.navigateByUrl(`/${ path }`).then( (ok) => {
      this.menuCtrl.close();
    }).catch(e => {
      throw new Error( e );
    });
  }

}
