import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IonInfiniteScroll, ModalController, PopoverController } from '@ionic/angular';
import { SocketService } from '../../services/socket.service';
import { IServiceHistory } from '../../interfaces/history.interface';
import { Subscription } from 'rxjs';
import { HistoryService } from '../../services/history.service';
import { retry } from 'rxjs/operators';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';
import { PopoverHistoryComponent } from '../../components/popover-history/popover-history.component';
import { ModalInfoServicePage } from '../modal-info-service/modal-info-service.page';
import { ModalCalificationPage } from '../modal-calification/modal-calification.page';
import { UiUtilitiesService } from '../../services/ui-utilities.service';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit, OnDestroy {

  @ViewChild( IonInfiniteScroll ) historyScroll: IonInfiniteScroll;

  page = 1;
  historySbc: Subscription;
  pathImg = URI_SERVER + '/User/Img/Get/';

  dataService: IServiceHistory[] = [];
  loading = false;
  // tslint:disable-next-line: max-line-length
  constructor( public io: SocketService, private historySvc: HistoryService, public st: StorageService , private popoverCtrl: PopoverController, private modalCtrl: ModalController, private ui: UiUtilitiesService) { }

  ngOnInit() {
    this.loading = true;
    this.st.onLoadToken().then( () => {
      this.onGetHistory();

    }).catch( e => console.log('Error al cargar storage') );
  }

  loadData() {
    this.page += 1;
    this.onGetHistory();
  }

  async presentPopover(ev: any, item: IServiceHistory) {
    const popover = await this.popoverCtrl.create({
      component: PopoverHistoryComponent,
      cssClass: 'my-custom-class',
      event: ev,
      mode: 'ios',
      componentProps: {
        service: item
      },
      translucent: true
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();

    const modal = await this.modalCtrl.create({
      component: data.code === 1 ? ModalInfoServicePage : ModalCalificationPage,
      mode: 'md',
      componentProps: {
        dataService: data.service,
        token: this.st.token
      }
    });

    await modal.present();

    modal.onWillDismiss().then( async (val) => {
      if (val.data.ok) {
        if (val.role === 'calification') {
          const finded = this.dataService.find( rec => rec.pkService === item.pkService );
          if (finded) {
            finded.calification = val.data.value;
          }
          await this.ui.onHideLoading();
        }
      }
    }).catch( e => console.error('Error al cerrar modal') );

  }

  onGetHistory() {
    this.historySbc = this.historySvc.onGetHistory( this.page )
    .pipe( retry() )
    .subscribe( ( res ) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      if (res.total === 0) {
        this.historyScroll.complete();
        this.historyScroll.disabled = true;
        return;
      }

      this.dataService.push( ...res.data );
      this.historyScroll.complete();
      this.loading = false;

    });
  }

  ngOnDestroy() {
    if (this.historySbc) {
      this.historySbc.unsubscribe();
    }
  }

}
