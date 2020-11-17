import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import IConfJ from 'src/app/interfaces/confJournal.interface';
import IJournal from 'src/app/interfaces/journal.interface';
import { JournalService } from 'src/app/services/journal.service';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import * as moment from 'moment';

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

  dataJournal: IJournal[] = [];
  dataJournalClosed: IJournal[] = [];
  dataConf: IConfJ[] = [];
  fkConfJournal = null;
  loading = false;
  loadingClose = false;

  constructor( private st: StorageService, private journalSvc: JournalService, private ui: UiUtilitiesService ) { }

  ngOnInit() {
    this.JournalSlide.lockSwipes( true );
    this.st.onLoadJournal();
    this.st.onLoadToken().then( () => {
      this.onLoadConf();
      this.onGetJournal();
    }).catch( e => console.error('Error al cargar storage') );

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
    this.getJSbc = this.journalSvc.onGetJournal( true ).subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataJournal = res.data;

      const finded = this.dataJournal.find( conf => conf.pkJournalDriver === this.st.dataJournal.pkJournalDriver );
      if (finded) {

        this.st.dataJournal.dateStart = finded.dateStart;
        this.st.dataJournal.expired = finded.expired;

        this.st.onSetItem('dataJournal', this.st.dataJournal, true);

      }

    });

    this.getJClosedSbc = this.journalSvc.onGetJournal( false ).subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataJournalClosed = res.data;

    });
  }

  onOpenJournal() {

    this.loading = true;
    this.addSbc = this.journalSvc.onAddJDriver( this.fkConfJournal ).subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );
      
      if (res.showError === 0) {
        const finded = this.dataConf.find( conf => conf.pkConfigJournal === this.fkConfJournal );
        if (finded) {

          const dateStart = moment( res.data.dateStart );
          this.dataJournal.push({
            pkJournalDriver: res.data.pkJournal,
            codeJournal: res.data.codeJournal,
            fkConfigJournal: this.fkConfJournal,
            dateStart: res.data.dateStart,
            dateEnd: '',
            dateExpired: dateStart.add( 24, 'hours' ).format('YYYY/MM/DD hh:mm'),
            totalJournal: 0,
            countService: 0,
            nameJournal: finded.nameJournal,
            rateJournal: finded.rateJournal,
            modeJournal: finded.modeJournal
          });

          const dataJournal = {
            pkJournalDriver : Number( res.data.pkJournal ),
            codeJournal : res.data.codeJournal,
            nameJournal : finded.nameJournal,
            rateJournal : finded.rateJournal,
            modeJournal : finded.modeJournal,
            dateStart: res.data.dateStart,
            dateExpired: dateStart.add( 24, 'hours' ).format('YYYY/MM/DD hh:mm'),
            expired: false
          };
          this.st.dataJournal = dataJournal;

          await this.st.onSetItem('dataJournal', dataJournal, true);

        }
      }
      this.loading = false;

    });

  }

  onCloseJournal( pkJournal: number ) {
    this.loadingClose = true;
    this.addSbc = this.journalSvc.onCloseJDriver( pkJournal ).subscribe( async(res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onShowToast( this.onGetErrorClose( res.showError ), 4500 );

      if (res.showError === 0) {
        const finded = this.dataJournal.find( conf => conf.pkJournalDriver === pkJournal );
        if (finded) {

          finded.dateEnd = res.data.dateEnd;
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
      this.loadingClose = false;

    });
  }

  onGetErrorClose( showError: number ) {
    let arrErr = showError === 0 ? ['Se cerró con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr = ['Error', 'no se encontró jornada'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr = ['Error', 'esta jornada ya ha sido cerrada']
    }

    return arrErr.join(', ');

  }

  onGetError( showError: number ) {
    const arrErr = showError === 0 ? ['Se aperturó con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('aun tiene una jornada abierta, primero cerrar');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('ya existe una jornada con este código');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('no se encontró conductor');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr.push('tarifa inválida');
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
