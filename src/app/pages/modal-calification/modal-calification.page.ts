import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalificationModel } from '../../models/calification.model';
import { IServiceAccepted } from '../../interfaces/services.interface';
import { environment } from '../../../environments/environment';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { TaxiService } from '../../services/taxi.service';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-modal-calification',
  templateUrl: './modal-calification.page.html',
  styleUrls: ['./modal-calification.page.scss'],
})
export class ModalCalificationPage implements OnInit, OnDestroy {
  @Input() dataService: IServiceAccepted;
  @Input() token: string;

  califSbc: Subscription;
  bodyCalif: CalificationModel;
  pathImg = URI_SERVER + '/User/Img/Get/';

  constructor( private modalCtrl: ModalController, private ui: UiUtilitiesService, private taxiSvc: TaxiService ) { }

  ngOnInit() {
    this.bodyCalif = new CalificationModel();
  }

  async onCalification() {
    await this.ui.onShowLoading('Guardando...');
    this.califSbc = this.taxiSvc.onCalification( this.dataService.pkService, this.bodyCalif, this.token )
    .pipe( retry() )
    .subscribe( async(res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      if (res.showError !== 0) {
        await this.ui.onHideLoading();
        this.ui.onShowToast( this.onGetError( res.showError ), 4500 );
        return;
      }

      await this.modalCtrl.dismiss({ok: true, value: this.bodyCalif.calification}, 'calification');

    });
  }

  onGetError( showError: number ) {
    const arrErr = showError === 0 ? ['Se calificó servicio con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('no se encontró registro');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('ya ha calificado este servicio');
    }

    return arrErr.join(', ');
  }

  onCloseModal() {
    this.modalCtrl.dismiss({ok: false}, 'cancel');
  }

  ngOnDestroy() {
    this.califSbc.unsubscribe();
  }

}
