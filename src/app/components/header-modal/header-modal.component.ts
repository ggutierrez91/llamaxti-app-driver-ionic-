import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-header-modal',
  templateUrl: './header-modal.component.html',
  styleUrls: ['./header-modal.component.scss'],
})
export class HeaderModalComponent implements OnInit {

  // tslint:disable-next-line: no-input-rename
  @Input( 'title' ) titleModal: string;

  @Input( 'prof-avatar' ) srcAvatar: string;
  @Input( 'header-color' ) hedColor: string;

  constructor( private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.srcAvatar = './assets/profession-avatars/png/' + this.srcAvatar;
  }

  async onHideModal() {
    await this.modalCtrl.dismiss();
  }

}
