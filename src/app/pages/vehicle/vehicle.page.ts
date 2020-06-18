import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { VehicleModalPage } from '../vehicle-modal/vehicle-modal.page';
import { VehicleService } from '../../services/vehicle.service';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import IVehicle from '../../interfaces/vehicle.interface';
import { environment } from '../../../environments/environment';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { Router } from '@angular/router';

const URI_SERVER = environment.URL_SERVER;
@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.page.html',
  styleUrls: ['./vehicle.page.scss'],
})
export class VehiclePage implements OnInit, OnDestroy {

  vhSbc: Subscription;
  usingSbc: Subscription;
  usingGetSbc: Subscription;
  dataVehicle: IVehicle[] = [];
  loading = false;
  pathImg = URI_SERVER + '/Driver/Img/Get/vehicle/';

  // tslint:disable-next-line: max-line-length
  constructor( private modalCtrl: ModalController, private vehicleSvc: VehicleService, public st: StorageService, private alertCtrl: AlertController, private ui: UiUtilitiesService, private router: Router ) { }

  ngOnInit() {
    this.loading = true;
    this.st.onLoadToken().then( () => {

      this.onGetVehicles();

    });

  }

  async onShowModalAdd() {
    const modalAdd = await this.modalCtrl.create({
      component: VehicleModalPage,
      animated: true,
      mode: 'ios'
    });

    await modalAdd.present();
    modalAdd.onDidDismiss().then( (resModal: any) => {
      if (resModal.ok) {
        this.onGetVehicles();
      }
    });
  }

  onRedirectAdd() {
    this.router.navigateByUrl('/vehicle-add');
  }

  onGetVehicles() {

    this.vhSbc = this.vehicleSvc.onGetVehicle( this.st.pkDriver ).subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataVehicle = res.data;
      this.loading = false;
    });

  }

  async onShowConfirm( pkVehicle: number ) {

    const finded = this.dataVehicle.find( vh => vh.pkVehicle === pkVehicle );

    const alertUsing = await this.alertCtrl.create({
      header: '¡Confirmación!',
      message: `¿Está seguro de pasar a usar ${ finded.nameBrand }-${ finded.numberPlate }?`,
      mode: 'ios',
      buttons: [{
        text: 'Aceptar',
        handler: () => {
            this.onChangeUsingVehicle( pkVehicle );
        }
      }, {
        text: 'Cerrar',
        cssClass: 'text-danger',
        role: 'cancel',
        handler: () => { }
      }]
    });

    await alertUsing.present();

  }

  onChangeUsingVehicle( pkVehicle: number ) {

    this.ui.onShowLoading('Espere...').then( () => {

      this.usingSbc = this.vehicleSvc.onUsingVehicle( pkVehicle ).subscribe( async(res) => {

        if (!res.ok) {
          throw new Error( res.error );
        }

        await this.ui.onHideLoading();
        await this.ui.onShowToast( this.onGetError(res.showError), 5000 );

        if (res.showError === 0) {
          this.onGetUsing();
        }

      });

    }).catch(e => console.error('Error al mostrar loading', e) );

  }

  onGetError( showError: number ) {

    const arrError = showError === 0 ? ['Se cambio con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError.push('no se encontró vehículo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrError.push('vehículo pendiente de verificación');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrError.push('vehículo inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrError.push('no se encontró conductor');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrError.push('conductor inactivo');
    }

    return arrError.join(', ');

  }

  onGetUsing() {
    this.usingGetSbc = this.vehicleSvc.onGetUsing().subscribe( async ( res ) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      if (!res.data) {
        return ;
      }

      this.st.pkVehicle = res.data.pkVehicle;
      this.st.fkCategory = res.data.pkCategory;
      this.st.category = res.data.aliasCategory;
      this.st.brand = res.data.nameBrand;
      this.st.numberPlate = res.data.numberPlate;

      await this.st.onSetItem('pkVehicle', res.data.pkVehicle);
      await this.st.onSetItem('fkCategory', res.data.pkCategory);
      await this.st.onSetItem('category', res.data.aliasCategory);
      await this.st.onSetItem('brand', res.data.nameBrand);
      await this.st.onSetItem('numberPlate', res.data.numberPlate);

    });
  }

  ngOnDestroy() {
    this.vhSbc.unsubscribe();

    if (this.usingSbc) {
      this.usingSbc.unsubscribe();
    }

    if (this.usingGetSbc) {
      this.usingGetSbc.unsubscribe();
    }

  }

}
