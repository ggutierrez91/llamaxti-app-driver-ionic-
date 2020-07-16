import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-calification',
  templateUrl: './modal-calification.page.html',
  styleUrls: ['./modal-calification.page.scss'],
})
export class ModalCalificationPage implements OnInit {

  constructor( private modalCtrl: ModalController ) { }

  ngOnInit() {
  }

  onCloseModal() {
    this.modalCtrl.dismiss({ok: true});
  }

}
