import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IonSlides, IonContent, NavController, MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DriverModel } from '../../models/user-driver.model';
import { DriverFilesModel, EEntity, ETypeFile } from '../../models/user-driver-files.model';
import { NgForm } from '@angular/forms';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { UploadService } from '../../services/upload.service';
import { IResApi } from '../../interfaces/response-api.interface';
import { StorageService } from '../../services/storage.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-singin',
  templateUrl: './singin.page.html',
  styleUrls: ['./singin.page.scss'],
})
export class SinginPage implements OnInit, OnDestroy {

  @ViewChild('driverSlide', {static: true}) slidesDriver: IonSlides;
  @ViewChild('driverContent', {static: true}) content: IonContent;
  slideIndex = 0;

  bodyDriver: DriverModel;
  driverFiles: DriverFilesModel;

  optSlider = {
    initialSlide: 0,
    direction: 'horizontal',
    speed: 900,
    effect: 'fade',
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
  };

  // tslint:disable-next-line: max-line-length
  constructor(private authSvc: AuthService, private uiSvc: UiUtilitiesService, private uploadSvc: UploadService, private navCtrl: NavController, private storageSvc: StorageService, private io: SocketService, private menuCtrl: MenuController) { }

  ngOnInit() {
    /**
     * this.isEmplyee = true;
     * this.isProper = true;
     */
    this.bodyDriver = new DriverModel();

    this.driverFiles = new DriverFilesModel();

    this.menuCtrl.swipeGesture(false);

    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.license, true );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.photoCheck, true );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.criminalRecord, false );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.policialRecord, false );

    // this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.lease, false   );
    this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.soat, true );
    this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.propertyCard, true );
    // this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.dni, true );
    this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.taxiFrontal, true );
    this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.taxiBack, true );
    this.driverFiles.onAddFile( EEntity.vehicle, ETypeFile.taxiInterior, true );

    this.slidesDriver.lockSwipes(true);

  }

  async onBackSlide() {
    await this.slidesDriver.lockSwipes( false );
    await this.slidesDriver.slidePrev();
    this.slideIndex -= 1;
    await this.slidesDriver.lockSwipes( true );
    this.content.scrollToTop(50);
  }

  async onNextSlide() {
    await this.slidesDriver.lockSwipes( false );
    await this.slidesDriver.slideNext();
    this.slideIndex += 1;
    await this.slidesDriver.lockSwipes( true );
    this.content.scrollToTop(50);
  }

  onNextInfo(data: any) {
    this.bodyDriver = data.bodyDriver;
    this.onNextSlide();
    // console.log(this.bodyDriver);
  }

  onNextBackDriver(data: any) {
    console.log('click desde hijo', data);

    if (data.action === 'back') {
      this.onBackSlide();
    } else {
      this.bodyDriver = data.bodyDriver;
      this.driverFiles = data.driverFiles;
      this.onNextSlide();
    }
  }

  onNextBackVehicle( data: any ) {
    console.log('click desde hijo', data);

    if (data.action === 'back') {
      this.onBackSlide();
    } else {
      this.bodyDriver = this.bodyDriver;
      this.driverFiles = this.driverFiles;
      this.onNextSlide();
    }
  }

  onNextBackVehicleTwo(data: any) {
    console.log('click desde hijo', data);

    if (data.action === 'back') {
      this.onBackSlide();
    } else {
      this.bodyDriver = this.bodyDriver;
      this.driverFiles = this.driverFiles;
      this.onNextSlide();
    }
  }

  onSingDriver( frm: NgForm ) {

    this.uiSvc.onShowLoading('Guardado...');

    if (frm.valid) {
      this.bodyDriver.numberPlate = this.bodyDriver.numberPlate.toUpperCase();

      this.authSvc.onSaveDriver( this.bodyDriver ).subscribe( async (resSingin) => {
        if (!resSingin.ok) {
          throw new Error( resSingin.error );
        }

        if (resSingin.showError !== 0) {
          await this.uiSvc.onHideLoading();
          this.uiSvc.onShowAlert( this.onGetError( resSingin.showError ) );
          return;
        }
        const pkDriver = resSingin.data.pkDriver;
        const pkVehicle = resSingin.data.pkVehicle;

        this.storageSvc.token = resSingin.token || '';
        await this.storageSvc.onSaveCredentials( resSingin.token, resSingin.data );
        // subiendo imagen perfil del conductor
        this.uploadSvc.onUploadImg( this.bodyDriver.img, resSingin.data.pkUser, resSingin.token ).then( async (resUp) => {
          const resJson: IResApi = JSON.parse( resUp.response );
          if (!resJson.ok) {
            throw new Error( resJson.error );
          }

          let idEntity = 0;
          let resUpDocs: any;
          let resDocsJson: IResApi;

          const arrFilesUploaded: any[] = [];
          this.driverFiles.filesDriver.forEach( async (item) => {

            if (item.pathFile !== '') {

              idEntity = item.entity === 'DRIVER' ? pkDriver : pkVehicle;

              resUpDocs = await this.uploadSvc.onUploadDocuments( item.pathFile
                                              , item.entity
                                              , idEntity
                                              , item.typeFile
                                              , resSingin.token
                                              , item.isPdf );
              resDocsJson = JSON.parse( resUpDocs.response );
              if (!resDocsJson.ok) {
                throw new Error( resDocsJson.error );
              }
              arrFilesUploaded.push( `Se subio archivo ${ item.typeFile }` );
            }

          });

          this.onRedirecHome(resSingin);

        }).catch( (e) => {
          console.error('Error al subir imagen de perfil conductor');
          throw new Error( e );
        });

      });
    }

  }

  async onRedirecHome( resSingin: IResApi ) {
    const payload = {
      dataUser: resSingin.data,
      title: 'Alta de conductor',
      subtitle: 'llamataxi app',
      message: `El usuario ${ resSingin.data.userName }, con rol conductor ha creado cuenta con éxito.`,
      urlShow: `/admin/profileDriver/${ resSingin.data.pkDriver }`
    };
    await this.io.onSingUser();
    this.io.onEmit('send-notification-web', payload, (resSocket: any) => {
      console.log('respuesta socket', resSocket);
    });
    this.io. onEmit('occupied-driver', {occupied: false}, (resOccupied) => {
      console.log('Cambiando estado conductor', resOccupied);
    });
    await this.uiSvc.onHideLoading();
    this.navCtrl.navigateRoot('welcome', {animated: true});
  }

  onGetError( showError: number ) {

    let arrError = showError === 0 ? ['Cuenta creada exitosamente'] : ['Error ya existe un usuario'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError.push('asociado con este email');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrError.push('se encuentra inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrError.push('con este nombre de usuario');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrError.push('asociado con este numero de placa');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrError = ['Tipo de documento inválido'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrError = ['Nacionalidad inválida'];
    }

    return arrError.join(', ');
  }

  ngOnDestroy() {
    this.menuCtrl.swipeGesture(true);
  }

}
