import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { LiquidationsService } from '../../services/liquidations.service';
import { ILiquidation } from '../../interfaces/liquidation.interface';
import { ModalInfoLiqPage } from '../modal-info-liq/modal-info-liq.page';

@Component({
  selector: 'app-liquidations',
  templateUrl: './liquidations.page.html',
  styleUrls: ['./liquidations.page.scss'],
})
export class LiquidationsPage implements OnInit, OnDestroy {

  @ViewChild( IonInfiniteScroll ) LiqScroll: IonInfiniteScroll;

  listSbc: Subscription;
  page = 1;
  loading = false;
  data: ILiquidation[] = [];

  constructor( private st: StorageService, private liquiSvc: LiquidationsService, private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.loading = true;
    this.st.onLoadToken(  ).then( () => {
      this.onGetLiquidation();
    }).catch( e => console.error('Error al cargar storage') );

  }

  onGetLiquidation() {
    this.listSbc = this.liquiSvc.onGetLiq( this.page )
    // .pipe( retry() )
    .subscribe( ( res ) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      if (res.total === 0) {
        this.LiqScroll.complete();
        this.LiqScroll.disabled = true;
        return;
      }

      this.data.push( ...res.data );
      this.LiqScroll.complete();
      this.loading = false;

    });
  }

  async onShowInfo( data: ILiquidation ) {
    const modalInfo = await this.modalCtrl.create({
      component: ModalInfoLiqPage,
      componentProps: {
        data,
        token: this.st.token
      },
      mode: 'md',
      animated: true,
      cssClass: 'modalInfoLiq'
    });

    await modalInfo.present();
    await modalInfo.onDidDismiss();
  }

  loadData() {
    this.page += 1;
    this.onGetLiquidation();
  }

  ngOnDestroy(): void {

    if (this.listSbc) {
      this.listSbc.unsubscribe();
    }
    
  }

}
