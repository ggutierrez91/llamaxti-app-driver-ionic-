import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import IJournal from 'src/app/interfaces/journal.interface';
import { IResApi } from 'src/app/interfaces/response-api.interface';
import { CardModel } from 'src/app/models/card.model';
import { ChargeModel } from 'src/app/models/charge.model';
import { CloseJournalModel } from 'src/app/models/journal.model';
import { CulquiService } from 'src/app/services/culqui.service';
import { StorageService } from 'src/app/services/storage.service';
import { formatNumber } from '@angular/common';
import { JournalService } from 'src/app/services/journal.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { ItokenCulqui } from 'src/app/interfaces/culqui.interface';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-pay-journal',
  templateUrl: './modal-pay-journal.page.html',
  styleUrls: ['./modal-pay-journal.page.scss'],
})
export class ModalPayJournalPage implements OnInit, OnDestroy {

  @Input() journal: IJournal;
  @Input() token: string;

  bodyCard: CardModel;
  bodyCharge: ChargeModel;
  bodyClose: CloseJournalModel;

  tokenSbc: Subscription;
  cargeSbc: Subscription;
  closeSbc: Subscription;
  loading = false;

  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private culquiSvc: CulquiService, private journalSvc: JournalService, private ui: UiUtilitiesService, private modalCtrl: ModalController ) { }

  ngOnInit() {

    this.bodyCard = new CardModel();
    this.bodyCharge = new ChargeModel();
    this.bodyClose = new CloseJournalModel();

    this.st.onLoadCards().then( () => {
      if (this.st.cardsCulqui.length > 0) {

        this.bodyClose.pkJournal = this.journal.pkJournalDriver;

        this.bodyCard.card_number = this.st.cardsCulqui[0].cardAll;
        this.bodyCard.expiration_month = this.st.cardsCulqui[0].expiration_month;
        this.bodyCard.expiration_year = this.st.cardsCulqui[0].expiration_year;
        this.bodyCard.cvv = this.st.cardsCulqui[0].cvv;
        this.bodyCard.email = this.st.cardsCulqui[0].email;

        this.bodyCharge.amount = Number( formatNumber( this.journal.totalDebt + this.journal.totalPay, 'en', '.2-2' ).replace('.', '') );
        this.bodyCharge.cardCulqui = this.st.cardsCulqui[0].card_number;
        this.bodyCharge.pkJournal = this.journal.pkJournalDriver;

        this.bodyClose.cardTkn = this.st.cardsCulqui[0].token;
      }
    }).catch( e => console.error('Error al cargar tarjetas storage'));

  }

  onChangeCard() {
    const finded = this.st.cardsCulqui.find( rec => rec.token === this.bodyClose.cardTkn );
    if (finded) {
      this.bodyCard.card_number = finded.cardAll;
      this.bodyCard.expiration_month = finded.expiration_month;
      this.bodyCard.expiration_year = finded.expiration_year;
      this.bodyCard.cvv = finded.cvv;
      this.bodyCard.email = finded.email;

      this.bodyCharge.email = finded.email;
      this.bodyCharge.cardCulqui = finded.card_number;
    }
  }

  onClose() {
    this.modalCtrl.dismiss({ok: false}, 'close');
  }

  async onSubmit() {

    this.loading = true;

    if ( this.bodyCharge.amount < 300 ) {
      // cuando es menor a 300 solo se cierra y queda pendiente de pago
      this.onCloseJournal();
    } else {
      // si es mayor se realiza el cargo
      // si falla la act del token culqui solo cerrar, sino cerrar y realizar cargo

      const resToken = await this.onRefreshToken();
      if (!resToken.ok) {
        this.loading = false;
        return this.ui.onShowToastTop('Error al verificar tarjeta', 4500);
      }
      const dataToken: ItokenCulqui = resToken.data;
      this.bodyCharge.source_id = dataToken.id;

      this.onCloseJournal();

    }

  }

  onCloseJournal() {

    this.closeSbc = this.journalSvc.onCloseJDriver( this.bodyClose, this.token )
    .subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onShowToastTop( this.onGetErrorClose( res.showError ), 4500 );

      if (res.showError === 0) {

        if (this.bodyCharge.amount >= 300) {

          const resCarge = await this.onCarge( );
          if (!resCarge.ok) {
            // console.log('Error al procesar pago', resCarge.error);
            this.loading = false;
            return this.ui.onShowToastTop( resCarge.error.merchant_message || 'Error al procesar pago' , 5000);
          }

        }

        // res.data.dateEnd;
        this.modalCtrl.dismiss({
          ok: true,
          dateEnd: res.data.dateEnd,
          journal: this.journal
        }, 'ok');

      }
      this.loading = false;

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

  onGetErrorClose( showError: number ) {
    let arrErr = showError === 0 ? ['Se cerró con éxito'] : ['Alerta'];

    if (this.bodyCharge.amount < 300) {
      arrErr.push('no se realizó el cobro por ser menor a S/ 3.00');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr = ['Alerta', 'no se encontró jornada'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr = ['Alerta', 'esta jornada ya ha sido cerrada'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr = ['Alerta', 'Ha excedido el límite de jornadas sin pagar, realice el pago primero'];
    }

    return arrErr.join(', ');

  }

  ngOnDestroy() {

    if (this.tokenSbc) {
      this.tokenSbc.unsubscribe();
    }

    if (this.cargeSbc) {
      this.cargeSbc.unsubscribe();
    }

  }

}
