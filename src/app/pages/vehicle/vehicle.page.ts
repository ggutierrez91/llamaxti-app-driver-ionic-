import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { VehicleModalPage } from '../vehicle-modal/vehicle-modal.page';
import { VehicleService } from '../../services/vehicle.service';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import IVehicle from '../../interfaces/vehicle.interface';
import { environment } from '../../../environments/environment';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { SocketService } from '../../services/socket.service';
import { IResSocket } from '../../interfaces/response-socket.interface';

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
  delSbc: Subscription;
  dataVehicle: IVehicle[] = [];
  loading = false;
  pathImg = URI_SERVER + '/Driver/Img/Get/vehicle/';
  tokenPath = '';

  // tslint:disable-next-line: max-line-length
  constructor( private modalCtrl: ModalController, private vehicleSvc: VehicleService, public st: StorageService, private alertCtrl: AlertController, private ui: UiUtilitiesService, public io: SocketService) { }

  ngOnInit() {
    this.loading = true;
    this.st.onLoadToken().then( () => {

      this.tokenPath = `?idDriver=${ this.st.pkDriver }&token=${ this.st.token }`;
      this.onGetVehicles();

    });

  }

  async onShowModalAdd() {
    const modalAdd = await this.modalCtrl.create({
      component: VehicleModalPage,
      animated: true,
      mode: 'ios',
      componentProps: {
        loadData: false,
        token: this.st.token,
        data: {
          imgSoat: '',
          imgPropertyCard: '',
          imgTaxiFrontal: '',
          imgTaxiBack: '',
          imgTaxiInterior: ''
        }
      }
    });

    await modalAdd.present();
    modalAdd.onDidDismiss().then( (resModal) => {
      if (resModal.data.ok) {
        this.onGetVehicles();
      }
    });
  }

  async onEditVehicle( vh: IVehicle ) {

    const modalAdd = await this.modalCtrl.create({
      component: VehicleModalPage,
      // id: 'modalVehicle',
      animated: true,
      // mode: 'ios',
      componentProps: {
        loadData: true,
        token: this.st.token,
        data: vh
      }
    });

    await modalAdd.present();
    const { data, role} = await modalAdd.onDidDismiss();

    if (data.ok) {
      this.onGetVehicles();
    }

  }

  async onDeleteVehicle( vh: IVehicle ) {
    // const finded = this.dataVehicle.find( vh => vh.pkVehicle === pkVehicle );

    const alertUsing = await this.alertCtrl.create({
      header: '¡Confirmación!',
      message: `¿Está seguro de eliminar el vehículo con placa ${ vh.numberPlate }?`,
      mode: 'ios',
      buttons: [{
        text: 'Cerrar',
        cssClass: 'text-danger',
        role: 'cancel',
        handler: () => { }
      }, {
        text: 'Aceptar',
        handler: () => {
            this.onSubmitDel( vh.pkVehicle );
        }
      }]
    });

    await alertUsing.present();
  }

  async onSubmitDel( pkVehicle: number ) {
    await this.ui.onShowLoading('Eliminando...');
    this.delSbc = this.vehicleSvc.onDeleteVehicle( pkVehicle ).subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }


      if (res.showError === 0) {
        this.dataVehicle = this.dataVehicle.filter( vh => vh.pkVehicle !== pkVehicle );
      }
      await this.ui.onHideLoading();
      await this.ui.onShowToast( this.onGetErrorDel( res.showError ), 4500 );

    });

  }

  onGetVehicles() {
    this.loading = true;
    this.vhSbc = this.vehicleSvc.onGetVehicle( this.st.pkDriver ).subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataVehicle = res.data;

      this.dataVehicle.forEach( (vh) => {
        vh.srcTaxiFrontal = this.pathImg + vh.pkVehicle + `/${ vh.imgTaxiFrontal || 'xd.png' }${ this.tokenPath }`;
      });
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
        text: 'Cerrar',
        cssClass: 'text-danger',
        role: 'cancel',
        handler: () => { }
      },{
        text: 'Aceptar',
        handler: () => {
            this.onChangeUsingVehicle( pkVehicle );
        }
      }]
    });

    await alertUsing.present();

  }

  onChangeUsingVehicle( pkVehicle: number ) {

    this.ui.onShowLoading('Espere...').then( () => {

      this.usingSbc = this.vehicleSvc.onUsingVehicle( pkVehicle ).subscribe( async (res) => {

        if (!res.ok) {
          throw new Error( res.error );
        }

        await this.ui.onHideLoading();
        await this.ui.onShowToast( this.onGetError(res.showError), 5000 );

        if (res.showError === 0) {

          this.st.pkVehicle = pkVehicle;
          this.st.fkCategory = res.data.pkCategory;
          this.st.category = res.data.aliasCategory;
          this.st.codeCategory = res.data.codeCategory;
          this.st.brand = res.data.nameBrand;
          this.st.nameModel = res.data.nameModel;
          this.st.numberPlate = res.data.numberPlate;
          this.st.year = res.data.year;
          this.st.color = res.data.color;
          this.st.dataVehicle = res.data;

          res.data.pkVehicle = pkVehicle;
          await this.st.onSetItem('dataVehicle', res.data, true);
          await this.st.onSetItem('codeCategory', res.data.codeCategory, false);

          this.dataVehicle.forEach( vh => {
            vh.driverUsing = 0;
          });

          const indexVehicle = this.dataVehicle.findIndex( vh => vh.pkVehicle === pkVehicle );
          this.dataVehicle[indexVehicle].driverUsing = 1;

          this.io.onEmit('change-category',
                      { pkCategory: res.data.pkCategory, codeCategory: res.data.codeCategory },
                      ( resSocket: IResSocket ) => {
            console.log('Notificando a backend =>', resSocket);
          });

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

  onGetErrorDel( showError: number ) {

    const arrError = showError === 0 ? ['Se eliminó con éxito'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError.push('no se encontró vehículo');
    }

    return arrError.join(', ');

  }

  ngOnDestroy() {
    this.vhSbc.unsubscribe();

    if (this.usingSbc) {
      this.usingSbc.unsubscribe();
    }

    if (this.usingGetSbc) {
      this.usingGetSbc.unsubscribe();
    }

    if (this.delSbc) {
      this.delSbc.unsubscribe();
    }

  }

}
