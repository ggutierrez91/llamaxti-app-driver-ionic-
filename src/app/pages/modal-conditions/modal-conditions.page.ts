import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-conditions',
  templateUrl: './modal-conditions.page.html',
  styleUrls: ['./modal-conditions.page.scss'],
})
export class ModalConditionsPage implements OnInit {

  constructor( private modalCtrl: ModalController ) { }

  ngOnInit() {
  }

  onClose() {
    this.modalCtrl.dismiss({});
  }

}
