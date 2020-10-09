import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import IVehicle from 'src/app/interfaces/vehicle.interface';

@Component({
  selector: 'app-popover-vehicle',
  templateUrl: './popover-vehicle.component.html',
  styleUrls: ['./popover-vehicle.component.scss'],
})
export class PopoverVehicleComponent implements OnInit {

  @Input() vehicle: IVehicle;

  constructor( private popCtrl: PopoverController ) { }

  ngOnInit() {}

  onClickPop( opt: number ) {
    this.popCtrl.dismiss({ opt, value: this.vehicle }, 'ok');
  }

}
