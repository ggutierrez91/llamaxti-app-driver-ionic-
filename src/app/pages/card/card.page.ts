import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ItokenCulqui } from 'src/app/interfaces/culqui.interface';
import { INationality } from 'src/app/interfaces/user-socket.interface';
import { CulquiService } from 'src/app/services/culqui.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { CardModel } from '../../models/card.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
})
export class CardPage implements OnInit, OnDestroy {

  culquiKey: string;
  culquiSbc: Subscription;

  body: CardModel;

  sbcNationality: Subscription;
  dataNationality: INationality[] = []; // pkNationality, nameCountry, prefixPhone, isoAlfaTwo
  loadingRm = false;

  // tslint:disable-next-line: max-line-length
  constructor( private culqui: CulquiService, public st: StorageService, private ui: UiUtilitiesService) { }

  ngOnInit() {
    this.body = new CardModel();
    this.st.onLoadToken().then( () => {
      // this.onLoadKey();
      this.body.email = this.st.dataUser.email || '';
      this.st.onLoadCards().then( () => {

      }).catch(e => console.error('Error al cargar cargar cards storage', e));

    }).catch( e => console.error('Error al cargar cargar storage', e) );

  }

  async onValidCard( frm: NgForm ) {
    if (frm.valid) {

      const finded = this.st.cardsCulqui.find( rec => rec.cardAll === this.body.card_number );
      if (finded) {
        return this.ui.onShowToast('Ya existe una tarjeta con este Nro', 4500);
      }

      if ( this.st.cardsCulqui.length >= 3 ) {
        return this.ui.onShowToast('Solo puede asociar 3 tarjetas como máximo', 4500);
      }

      await this.ui.onShowLoading('Espere...');
      const arrExp = this.body.expiration.split('/');
      this.body.expiration_month = arrExp[0];
      this.body.expiration_year = `20${ arrExp[1] }`;
      this.culquiSbc = this.culqui.onGetToken( this.body ).subscribe( async (res) => {
        if ( !res.ok ) {
          throw new Error( res.error );
        }

        const resCulqui: ItokenCulqui = res.data;
        if (resCulqui.id && resCulqui.id !== '') {
          await this.st.onSaveCard( resCulqui, this.body );
          await this.ui.onHideLoading();
          await this.ui.onShowToast( 'Tarjeta asociada con éxito', 4500 );
          this.body.onReset();
          return ;
        }
        await this.ui.onShowToast( 'Error al asociar, intente nuevamente', 4500 );

      });
    }
  }

  onRemoveCard( tkn: string ) {
    this.loadingRm = true;
    this.st.cardsCulqui = this.st.cardsCulqui.filter( rec => rec.token !== tkn );
    this.st.onSetItem( 'cardsCulqui', this.st.cardsCulqui, true ).then( () => {
      this.loadingRm = false;
    }).catch( e => console.error('Error al eliminar tarjeta culqui', e) );
  }

  onChangeExp() {

    const str = this.body.expiration;
    if (str.length === 3) {

      const arrSplit = str.split( /^[0-9]{2,2}/ );
      console.log('arrSplit', arrSplit);

      const strInit = str.substr(0, 2);

      this.body.expiration = `${ strInit }/${ arrSplit[1] }`;
    }

  }

  ngOnDestroy() {
    if (this.culquiSbc) {
      this.culquiSbc.unsubscribe();
    }
  }

}
