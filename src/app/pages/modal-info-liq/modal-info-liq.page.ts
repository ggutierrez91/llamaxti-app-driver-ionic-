import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ILiqInfo, ILiquidation } from 'src/app/interfaces/liquidation.interface';
import { LiquidationsService } from 'src/app/services/liquidations.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-modal-info-liq',
  templateUrl: './modal-info-liq.page.html',
  styleUrls: ['./modal-info-liq.page.scss'],
})
export class ModalInfoLiqPage implements OnInit, OnDestroy {

  @Input() data: ILiquidation;

  dataInfo: ILiqInfo[] = [];
  infoSbc: Subscription;

  constructor( private modalCtrl: ModalController, private st: StorageService, private liqSvc: LiquidationsService ) { }

  ngOnInit() {

    this.st.onLoadToken().then( () => {
      this.onGetInfo();
    }).catch( e => console.error( 'Error al cargatr storage', e ) );

  }

  onGetInfo() {
    this.infoSbc = this.liqSvc.onGetInfoLiq( this.data.pkLiquidation )
    .subscribe( (res) => {
      
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataInfo = res.data;

    });
  }

  async onClose() {
    await this.modalCtrl.dismiss({}, 'close');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    if (this.infoSbc) {
      this.infoSbc.unsubscribe();
    }
    
  }

}
