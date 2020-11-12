import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { IReferal } from 'src/app/interfaces/referal.interface';
import { ReferalService } from 'src/app/services/referal.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';

@Component({
  selector: 'app-points',
  templateUrl: './points.page.html',
  styleUrls: ['./points.page.scss'],
})
export class PointsPage implements OnInit, OnDestroy {

  @ViewChild( IonSlides, {static: true} ) slidePoin: IonSlides;
  @ViewChild( IonInfiniteScroll ) historyScroll: IonInfiniteScroll;

  vigentSbc: Subscription;
  usedSbc: Subscription;
  expiredSbc: Subscription;
  totalSbc: Subscription;

  dataVigent: IReferal[] = [];
  dataUsed: IReferal[] = [];
  dataExpired: IReferal[] = [];
  totalReferal = 0;

  pageVigent = 1;
  pageUsed = 1;
  pageExpired = 1;

  loadingVigent = false;
  loadingUsed = false;
  loadingExpired = false;

  constructor( private st: StorageService, private refSvc: ReferalService, private ui: UiUtilitiesService ) { }

  ngOnInit() {
    this.slidePoin.lockSwipes( true );
    this.st.onLoadToken().then( () => {

      this.onGetReferal();
      this.onGetReferalTotal();

    }).catch( e => console.error( 'Error al cargar storage', e ) );

  }

  onGetReferal() {

    this.loadingVigent = true;
    this.loadingUsed = true;
    this.loadingExpired = true;

    this.vigentSbc = this.refSvc.onReferal( 'OK', this.pageVigent )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataVigent = res.data;
      this.loadingVigent = false;

    });

    this.usedSbc = this.refSvc.onReferal( 'USED', this.pageUsed )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataUsed = res.data;
      this.loadingUsed = false;

    });

    this.expiredSbc = this.refSvc.onReferal( 'EXPIRED', this.pageExpired )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataExpired = res.data;
      this.loadingExpired = false;

    });
  }

  onGetReferalTotal() {

    this.totalSbc = this.refSvc.onReferalTotal(  )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.totalReferal = res.total;

    });

  }

  onGetMore() {
    this.loadingVigent = true;
    this.pageVigent += 1;
    this.vigentSbc = this.refSvc.onReferal( 'OK', this.pageVigent )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }
      
      if (res.data.lenght === 0) {
        this.historyScroll.complete();
        this.historyScroll.disabled = true;
        return;
      }
      
      this.dataVigent.push( ...res.data );
      this.historyScroll.complete();
      this.loadingVigent = false;

    });
  }

  segmentChanged( event: any ) {

    this.slidePoin.lockSwipes( false );

    const segment = event.detail.value;
    switch (segment) {
      case 'VIGENT':
        this.slidePoin.slideTo( 0 );
        break;

        case 'USED':
          this.slidePoin.slideTo( 1 );
          break;

          case 'EXP':
            this.slidePoin.slideTo( 2 );
            break;

      default:
      break;
    }
    this.slidePoin.lockSwipes( true );

  }

  ngOnDestroy(): void {

    if (this.vigentSbc) {
      this.vigentSbc.unsubscribe();
    }

    if (this.usedSbc) {
      this.usedSbc.unsubscribe();
    }

    if (this.expiredSbc) {
      this.expiredSbc.unsubscribe();
    }

    if (this.totalSbc) {
      this.totalSbc.unsubscribe();
    }
  }

}
