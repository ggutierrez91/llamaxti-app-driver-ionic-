import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { IAmountRef } from 'src/app/interfaces/referal.interface';
import { ReferalService } from 'src/app/services/referal.service';
import { StorageService } from 'src/app/services/storage.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-share-code',
  templateUrl: './share-code.page.html',
  styleUrls: ['./share-code.page.scss'],
})
export class ShareCodePage implements OnInit {
  @ViewChild( IonSlides, {static: true} ) slideShared: IonSlides;
  confSbc: Subscription;
  dataConf: IAmountRef = {
    pkConfigReferal: 0,
    amountClient: 0,
    bonusCliRef: 0,
    amountDriver: 0,
    bonusDriRef: 0,
    daysExpClient: 0,
    daysExpDriver: 0
  };

  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private refSvc: ReferalService, private cb: Clipboard, private ui: UiUtilitiesService, private sh: SocialSharing ) { }

  ngOnInit() {
    this.slideShared.lockSwipes( true );
    this.st.onLoadData();
    this.st.onLoadToken().then( () => {
      this.onLoadAmount();

    }).catch( e => console.error('Error al cargar storage', e) );
  }

  onLoadAmount() {
    this.confSbc = this.refSvc.onGetConfig()
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataConf = res.data;

    });
  }

  onCopy() {
    this.cb.copy( this.st.dataUser.codeReferal ).then( async() => {
      await this.ui.onShowToast('Copiado en el portapapeles', 4000);
    });
  }

  onShare() {
    // let msg = `Desde ${ this.dataServiceInfo.streetOrigin }, `;
    // msg += `hasta ${ this.dataServiceInfo.streetDestination }.`;
    // msg += `Conductor ${ this.dataServiceInfo.nameDriver }`;
    // const url = `http://www.google.com/maps/place/${ this.lat },${ this.lng }`;

    const msg = '🚨🚨 Llamataxi app 🚨🚨';
    const subject = 'App 100% peruana, pide tu taxi seguro y con las mejores tarifas';
    const url = 'https://play.google.com/store/apps/details?id=com.llamataxiperu.driverApp';
    this.sh.share( subject, msg, '', url ).then( (resShared) => {
      console.log('Se compartió ubicación exitosamente', resShared);
    }).catch( e => console.error( 'Error al compartir ubicación', e ) );
  }

}
