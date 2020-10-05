import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IServiceHistory } from 'src/app/interfaces/history.interface';

@Component({
  selector: 'app-popover-history',
  templateUrl: './popover-history.component.html',
  styleUrls: ['./popover-history.component.scss'],
})
export class PopoverHistoryComponent implements OnInit {

  @Input() service: IServiceHistory;

  constructor( private popoverCtrl: PopoverController ) { }

  ngOnInit() {
    console.log('servicio recibido', this.service);
  }

  onClickPop( code: number ) {
    this.popoverCtrl.dismiss( { code, service: this.service } );
  }

}
