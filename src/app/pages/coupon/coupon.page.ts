import { formatNumber } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ICoupon } from 'src/app/interfaces/coupon.interface';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { CouponService } from '../../services/coupon.service';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.page.html',
  styleUrls: ['./coupon.page.scss'],
})
export class CouponPage implements OnInit, OnDestroy {

  @ViewChild( IonSlides, {static: true} ) couponSlide: IonSlides;

  vigentSbc: Subscription;
  usedSbc: Subscription;
  expiredSbc: Subscription;
  couponSbc: Subscription;

  dataVigent: ICoupon[] = [];
  dataUsed: ICoupon[] = [];
  dataExp: ICoupon[] = [];

  codeCoupon = '';
  loadingUsed = false;


  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private couponSvc: CouponService, private ui: UiUtilitiesService, private alertCtrl: AlertController ) { }

  ngOnInit() {

    this.couponSlide.lockSwipes( true );
    this.st.onLoadToken().then( () => {
      this.onLoadCoupons();

    }).catch( e => console.error('Error al cargar storage') )

  }

  onLoadCoupons() {

    this.vigentSbc = this.couponSvc.onGetCoupon( 'OK' )
    // .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataVigent = res.data;

    });

    this.usedSbc = this.couponSvc.onGetCoupon( 'USED' )
    // .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataUsed = res.data;

    });

    this.expiredSbc = this.couponSvc.onGetCoupon( 'EXPIRED' )
    // .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataExp = res.data;

    });

  }

  segmentChanged( event: any ) {
    const status = event.detail.value || 'OK';
    this.couponSlide.lockSwipes( false );
    switch (status) {
      case 'OK':
        this.couponSlide.slideTo(0);
        break;
        case 'USED':
          this.couponSlide.slideTo(1);
          break;
          case 'EXPIRED':
            this.couponSlide.slideTo(2);
            break;
      default:
        this.couponSlide.slideTo(0, 100);
        break;
      }
    setTimeout(() => {
      this.couponSlide.lockSwipes( true );
    }, 300);

    console.log('segment change', event);
  }

  async onValidCoupon() {
    await this.ui.onShowLoading('Validando...');
    this.couponSbc = this.couponSvc.onAddCoupon( this.codeCoupon ).subscribe( async(res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onHideLoading();
      await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );
      if (res.showError === 0) {
        this.dataVigent.unshift( res.data );
      }

    });
  }

  async onUsedCoupon( pk: number ) {
    this.loadingUsed = true;
    const finded = this.dataVigent.find( vigent => vigent.pkCouponUser === pk );
    if (finded) {

      const alertRate = await this.alertCtrl.create({
        header: 'Mensaje al usuario',
        message: `Cupón válido a partir de una tarifa de S/ ${ formatNumber( finded.minRateService, 'en', '.2-2' ) }`,
        translucent: true,
        animated: true,
        mode: 'ios',
        buttons: [{
          text: 'Ok',
          handler: () => {}
        }]
      });

      if (finded.minRateService > 0) {
        await alertRate.present();
      }

      this.loadingUsed = false;
    }
  }

  onGetError( showError: number ) {
    const arrErr = showError === 0 ? ['Has recibido un cupón'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('no se encontró cupón');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('cupón expirado');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('cupón solo para conductores');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr.push('cupón inactivo');
    }

    return arrErr.join(', ');

  }

  ngOnDestroy() {

    if (this.vigentSbc) {
      this.vigentSbc.unsubscribe();
    }

    if (this.usedSbc) {
      this.usedSbc.unsubscribe();
    }

    if (this.expiredSbc) {
      this.expiredSbc.unsubscribe();
    }

    if (this.couponSbc) {
      this.couponSbc.unsubscribe();
    }

  }

}
