import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ILiqInfo, ILiquidation } from 'src/app/interfaces/liquidation.interface';
import { LiquidationsService } from 'src/app/services/liquidations.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { environment } from '../../../environments/environment.prod';

const URL_API = environment.URL_SERVER;

@Component({
  selector: 'app-modal-info-liq',
  templateUrl: './modal-info-liq.page.html',
  styleUrls: ['./modal-info-liq.page.scss'],
})
export class ModalInfoLiqPage implements OnInit, OnDestroy {

  @Input() data: ILiquidation;
  @Input() token: string;

  dataInfo: ILiqInfo[] = [];
  infoSbc: Subscription;

  totalCash = 0;
  totalCard = 0;
  totalCredit = 0;
  totalDiscount = 0;

  pathImg = URL_API + `/Img/Get/voucher/`;
  loadingDowland = false;
  loading = false;

  constructor( private modalCtrl: ModalController, public st: StorageService, private liqSvc: LiquidationsService,  private ui: UiUtilitiesService) { }

  ngOnInit() {
    console.log(this.token);
    this.st.onLoadToken().then( () => {
      this.onGetInfo();
    }).catch( e => console.error( 'Error al cargatr storage', e ) );

  }

  onGetInfo() {
    this.loading = true;
    this.infoSbc = this.liqSvc.onGetInfoLiq( this.data.pkLiquidation )
    .subscribe( (res) => {
      
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataInfo = res.data;

      this.dataInfo.forEach( (rec) => {

        this.totalCash += rec.totalCash;
        this.totalCard += rec.totalCard;
        this.totalCredit += rec.totalCredit;
        this.totalDiscount += rec.totalDiscount;

      });

      this.loading = false;

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
