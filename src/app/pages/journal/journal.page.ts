import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonSlides, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import IConfJ from 'src/app/interfaces/confJournal.interface';
import IJournal from 'src/app/interfaces/journal.interface';
import { JournalService } from 'src/app/services/journal.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import * as moment from 'moment';
import { CloseJournalModel, JournalModel } from '../../models/journal.model';
import { CardModel } from '../../models/card.model';
import { ChargeModel } from '../../models/charge.model';
import { formatNumber } from '@angular/common';
import { ICargeCulqui, ItokenCulqui } from 'src/app/interfaces/culqui.interface';
import { IResApi } from 'src/app/interfaces/response-api.interface';
import { CulquiService } from 'src/app/services/culqui.service';
import { ModalPayJournalPage } from '../modal-pay-journal/modal-pay-journal.page';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
})
export class JournalPage implements OnInit, OnDestroy {

  @ViewChild( IonSlides, {static: true} ) JournalSlide: IonSlides;

  getSbc: Subscription;
  getJSbc: Subscription;
  getJClosedSbc: Subscription;
  addSbc: Subscription;
  tokenSbc: Subscription;
  cargeSbc: Subscription;

  dataJournal: IJournal[] = [];
  dataJournalClosed: IJournal[] = [];
  dataConf: IConfJ[] = [];
  bodyJournal: JournalModel;
  loading = false;
  loadingClose = false;
  loadingData = true;

  bodyCard: CardModel;
  bodyCharge: ChargeModel;
  bodyClose: CloseJournalModel;

  showConfirmPay = false;

  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private journalSvc: JournalService, private ui: UiUtilitiesService, private culquiSvc: CulquiService, private alertCtrl: AlertController, private sheetCtrl: ActionSheetController, private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.bodyCard = new CardModel();
    this.bodyCharge = new ChargeModel();
    this.bodyClose = new CloseJournalModel();
    this.bodyJournal = new JournalModel();
    this.JournalSlide.lockSwipes( true );
    this.st.onLoadJournal();
    this.st.onLoadToken().then( () => {
      this.onLoadConf();
      this.onGetJournal();
    }).catch( e => console.error('Error al cargar storage') );

    this.st.onLoadCards().then( () => {
      console.log('cargando tarjetas');
    }).catch( e => console.error('Error al cargar tarjetas storage') );
  }

  onLoadConf() {
    this.getSbc = this.journalSvc.onGetConf().pipe( retry() ).subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataConf = res.data;

    });
  }

  segmentChanged( event: any ) {
    this.JournalSlide.lockSwipes( false );
    if (event.detail.value === 'VIGENT') {
      this.JournalSlide.slideTo(0);
    } else {
      this.JournalSlide.slideTo(1);
    }
    this.JournalSlide.lockSwipes( true );
  }

  onGetJournal() {
    this.getJSbc = this.journalSvc.onGetJournal( true )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataJournal = res.data;

      const finded = this.dataJournal.find( conf => conf.pkJournalDriver === this.st.dataJournal.pkJournalDriver );
      if (finded) {

        console.log('jornada finded', moment( finded.dateStart ).format('yyyy/MM/DD HH:mm:ss'));

        this.st.dataJournal.dateStart = moment( finded.dateStart ).format('yyyy/MM/DD HH:mm');
        this.st.dataJournal.expired = finded.expired;

        this.st.onSetItem('dataJournal', this.st.dataJournal, true);

      }
      this.loadingData = false;

    });

    this.getJClosedSbc = this.journalSvc.onGetJournal( false ).subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataJournalClosed = res.data;

    });
  }

  onRefreshToken(): Promise<IResApi> {
    return new Promise( (resolve, reject) => {
      this.tokenSbc = this.culquiSvc.onGetToken( this.bodyCard ).subscribe( (res) => {
        if (!res.ok) {
          resolve({ ok: false, error: res.error });
        }

        resolve({ ok: true, data: res.data });
      });
    });
  }

  onCarge(): Promise<IResApi> {
    return new Promise( (resolve, reject) => {
      this.cargeSbc = this.culquiSvc.onAddCarge( this.bodyCharge ).subscribe( (res) => {
        if (!res.ok) {
          resolve({ ok: false, error: res.error });
        }

        resolve({ ok: true, data: res.data });
      });
    });
  }

  async onOpenJournal() {

    this.loading = true;
    await this.ui.onShowLoading('Espere...');

    if (this.bodyJournal.advancePayment) {

      const resToken = await this.onRefreshToken();
      if (!resToken.ok) {
        await this.ui.onHideLoading();
        this.loading = false;
        return this.ui.onShowToastTop('Error al verificar tarjeta', 4500);
      }
      const dataToken: ItokenCulqui = resToken.data;
      this.bodyCharge.source_id = dataToken.id;
      this.bodyJournal.cardTkn = dataToken.id;

    }

    this.addSbc = this.journalSvc.onAddJDriver( this.bodyJournal )
    .subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      if (res.showError === 0) {

        const dateStart = moment( res.data.dateStart );
        let dateExpired = dateStart.add( 24, 'hours' ).format('YYYY/MM/DD hh:mm');
        if (res.data.modeConf !== 'FORTODAY') {
          dateExpired = moment( `${ dateStart.format( 'YYYY/MM/DD' ) } 23:59:59` ).format('YYYY/MM/DD hh:mm')
        }

        const dataJournal = {
          pkJournalDriver : Number( res.data.pkJournal ),
          codeJournal : res.data.codeJournal,
          nameJournal : this.bodyJournal.nameJournal,
          rateJournal : this.bodyJournal.rateJournal,
          modeJournal : this.bodyJournal.modeJournal,
          dateStart: res.data.dateStart,
          dateExpired,
          expired: false
        };
        this.st.dataJournal = dataJournal;

        await this.st.onSetItem('dataJournal', dataJournal, true);

        if (this.bodyJournal.advancePayment) {
          this.bodyCharge.pkJournal = res.data.pkJournal;
          const resCarge = await this.onCarge( );
          await this.ui.onHideLoading();
          if (!resCarge.ok) {
            // console.log('Error al procesar pago', resCarge.error);
            return this.ui.onShowToastTop( resCarge.error.merchant_message || 'Error al procesar pago' , 5000);
          }

          const dataCarge: ICargeCulqui = resCarge.data;

        } else {
          await this.ui.onHideLoading();
        }

        this.onGetJournal();

        // this.dataJournal.push(newJournal);
        this.bodyJournal.onReset();
      } else {
        await this.ui.onHideLoading();
      }
      await this.ui.onShowToast( this.onGetError( res.showError, res.data.pkJournalAux ), 4500 );
      this.loading = false;

    });

  }

  onChangeConf() {
    const finded = this.dataConf.find( rec => rec.pkConfigJournal === this.bodyJournal.fkConfJournal );

    // console.log(finded);
    if (finded) {
      this.bodyJournal.nameJournal = finded.nameJournal;
      this.bodyJournal.modeJournal = finded.modeJournal;
      this.bodyJournal.rateJournal = finded.rateJournal;
      this.bodyJournal.advancePayment = finded.advancePayment;

      if ( finded.advancePayment ) {
        if ( this.st.cardsCulqui.length > 0 ) {
          this.bodyJournal.cardTkn = this.st.cardsCulqui[0].token;
          this.bodyJournal.cardCulqui = this.st.cardsCulqui[0].card_number;

          this.bodyCard.card_number = this.st.cardsCulqui[0].cardAll;
          this.bodyCard.expiration_month = this.st.cardsCulqui[0].expiration_month;
          this.bodyCard.expiration_year = this.st.cardsCulqui[0].expiration_year;
          this.bodyCard.cvv = this.st.cardsCulqui[0].cvv;
          this.bodyCard.email = this.st.cardsCulqui[0].email;
    
          this.bodyCharge.email = this.st.cardsCulqui[0].email;
          const culquiAmount = Number( formatNumber( finded.rateJournal, 'en', '.2-2' ).replace('.', '') );
          this.bodyCharge.amount = culquiAmount;
          this.bodyJournal.chargeAmount = culquiAmount;

        }
      } else {
        this.bodyJournal.cardTkn = null;
        this.bodyJournal.cardCulqui = '';
        this.bodyJournal.chargeAmount = 0;
      }

    }
  }

  onChangeCard() {
    const finded = this.st.cardsCulqui.find( rec => rec.token === this.bodyJournal.cardTkn );
    if (finded) {
      this.bodyCard.card_number = finded.cardAll;
      this.bodyCard.expiration_month = finded.expiration_month;
      this.bodyCard.expiration_year = finded.expiration_year;
      this.bodyCard.cvv = finded.cvv;
      this.bodyCard.email = finded.email;

      this.bodyCharge.email = finded.email;
    }
  }

  async onSubmitClose() {

    this.loadingClose = true;
    this.addSbc = this.journalSvc.onCloseJDriver( this.bodyClose, this.st.token )
    .subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onShowToast( this.onGetErrorClose( res.showError ), 4500 );

      if (res.showError === 0) {
        this.onRemoveClosed( this.bodyClose.pkJournal, res.data.dateEnd );
      }
      this.loadingClose = false;

    });

  }

  async onRemoveClosed( pkJournal: number, dateEnd: string ) {
    const finded = this.dataJournal.find( conf => conf.pkJournalDriver === pkJournal );
    if (finded) {

      finded.dateEnd = dateEnd; // res.data.dateEnd;
      this.dataJournalClosed.unshift( finded );

      const dataJournal = {
        pkJournalDriver : 0,
        codeJournal : '',
        nameJournal : '',
        rateJournal : 0,
        modeJournal : '',
        dateStart: '',
        expired: true
      };
      this.st.dataJournal = dataJournal;

      await this.st.onSetItem('dataJournal', dataJournal, true);
      this.dataJournal = this.dataJournal.filter( jd => jd.pkJournalDriver !== pkJournal );

    }
  }

  async onCloseJournal( journal: IJournal ) {

    if (!journal.paidOut) {

     const modalPay = await this.modalCtrl.create({
        mode: 'ios',
        cssClass: ['dialog-modal'],
        component: ModalPayJournalPage,
        componentProps: {
          journal,
          token: this.st.token
        },
        animated: true,
     });

     await modalPay.present();

     modalPay.onDidDismiss().then( (value) => {
        console.log('carrando modal', value);
        const data = value.data;
        if (data.ok) {
          this.onRemoveClosed( data.journal.pkJournalDriver, data.dateEnd );
        }

     }).catch( e => console.error('error al cerrar modal close') );

    } else {
      this.bodyClose.pkJournal = journal.pkJournalDriver;
      this.onSubmitClose();
    }

  }

  onGetErrorClose( showError: number ) {
    let arrErr = showError === 0 ? ['Se cerró con éxito'] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr = ['Error', 'no se encontró jornada'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr = ['Error', 'esta jornada ya ha sido cerrada'];
    }

    return arrErr.join(', ');

  }

  onGetError( showError: number, pkJournalAux = 0 ) {
    let arrErr = showError === 0 ? ['Se aperturó con éxito'] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('aun tiene una jornada abierta, primero cerrar');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {

      const finded = this.dataJournal.find( conf => conf.pkJournalDriver === pkJournalAux );
      if (finded) {

        const dataJournal = {
          pkJournalDriver: pkJournalAux,
          codeJournal: finded.codeJournal,
          nameJournal: finded.nameJournal,
          rateJournal: finded.rateJournal,
          modeJournal: finded.modeJournal,
          dateStart: finded.dateStart,
          expired: finded.expired
        };
        this.st.dataJournal = dataJournal;

        this.st.onSetItem('dataJournal', dataJournal, true);
      }
      arrErr.push('jornada vigente');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('ya existe una jornada con este código');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr.push('no se encontró conductor');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErr.push('tarifa inválida');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrErr = ['Alerta!', 'ha excedido la cantidad de jornadas sin pagar, page primero'];
    }

    return arrErr.join(', ');

  }

  ngOnDestroy(): void {

    if (this.getSbc) {
      this.getSbc.unsubscribe();
    }

    if (this.getJSbc) {
      this.getJSbc.unsubscribe();
    }

    if (this.getJClosedSbc) {
      this.getJClosedSbc.unsubscribe();
    }

    if (this.addSbc) {
      this.addSbc.unsubscribe();
    }

  }

}
