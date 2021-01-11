import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IonSlides, IonContent, NavController, MenuController, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DriverModel } from '../../models/user-driver.model';
import { DriverFilesModel, EEntity, ETypeFile } from '../../models/user-driver-files.model';
import { NgForm } from '@angular/forms';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { IResApi } from '../../interfaces/response-api.interface';
import { StorageService } from '../../services/storage.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ModalConditionsPage } from '../modal-conditions/modal-conditions.page';
import { Upload21Service } from '../../services/upload21.service';
import { File, FileEntry } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-singin',
  templateUrl: './singin.page.html',
  styleUrls: ['./singin.page.scss'],
})
export class SinginPage implements OnInit, OnDestroy {

  @ViewChild('driverSlide', {static: true}) slidesDriver: IonSlides;
  @ViewChild('driverContent', {static: true}) content: IonContent;
  slideIndex = 0;

  driverSbc: Subscription;

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

  resJson: IResApi = {
    ok: false,
    data: [{nameFile: ''}]
  };

  // tslint:disable-next-line: max-line-length
  constructor(private authSvc: AuthService, private uiSvc: UiUtilitiesService, private navCtrl: NavController, private st: StorageService, private io: SocketService, private menuCtrl: MenuController, private modalCtrl: ModalController, private upload21: Upload21Service, private file: File) { }

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

    if (data.action === 'back') {
      this.onBackSlide();
    } else {
      this.bodyDriver = data.bodyDriver;
      this.driverFiles = data.driverFiles;
      this.onNextSlide();
    }
  }

  onNextBackVehicle( data: any ) {

    if (data.action === 'back') {
      this.onBackSlide();
    } else {
      this.bodyDriver = this.bodyDriver;
      this.driverFiles = this.driverFiles;
      this.onNextSlide();
    }
  }

  async onShowConditions() {
    const modalConditions = await this.modalCtrl.create({
      mode: 'ios',
      component: ModalConditionsPage,
      animated: true
    });

    await modalConditions.present();
  }

  onNextBackVehicleTwo(data: any) {

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

      this.driverSbc = this.authSvc.onSaveDriver( this.bodyDriver )
      // .pipe( retry() )
      .subscribe( async (resSingin) => {
        if (!resSingin.ok) {
          throw new Error( resSingin.error );
        }

        if (resSingin.showError !== 0) {
          await this.uiSvc.onHideLoading();
          this.uiSvc.onShowAlert( this.onGetError( resSingin.showError ) );
          return;
        }
        const pkDriver: number = resSingin.data.pkDriver;
        const pkVehicle: number = resSingin.data.pkVehicle;
        const pkUser: number = resSingin.data.pkUser;
        const tokenApi = resSingin.token;

        this.st.token = tokenApi || '';
        await this.st.onSaveCredentials( tokenApi, resSingin.data );
        await this.onSendUpload( this.bodyDriver.img, pkUser, tokenApi );
        resSingin.data.img = this.resJson.data[0].nameFile || 'xd.png';

        const arrFilesUploaded: any[] = [];
        await Promise.all( this.driverFiles.filesDriver.map( async (item) => {

          if (item.pathFile !== '') {

            const idEntity = item.entity === 'DRIVER' ? pkDriver : pkVehicle;

            const resUpDocs = await this.onSendDocument( item.pathFile
                                            , item.entity
                                            , item.typeFile
                                            , idEntity
                                            , tokenApi );
            let msgUpload = `Se subio archivo ${ item.typeFile }`;
            if (!resUpDocs.ok) {
              msgUpload = `Error al subir archivo archivo ${ item.typeFile }`;
            }
            arrFilesUploaded.push( msgUpload );
          }
        }) );

        this.onRedirecHome(resSingin);
      });
    }

  }

  onSendUpload( uriFile: string, pkUser: number, token = '' ): Promise<any> {

    return new Promise( (resolve) => {

      this.file.resolveLocalFilesystemUrl( uriFile ).then( (entry) => {
  
        (<FileEntry>entry).file( async (file) => {
          // this.readFile(file);
          const resUpload = await this.upload21.uploadImage( file, pkUser, token );

          console.log('response upload', resUpload);
          this.resJson = resUpload;
          

          resolve(true);
          
        });
  
      }).catch( (e) => {
  
        resolve(false);
  
      });
    });
  }

  onSendDocument( uriFile: string, entity: EEntity, doc: ETypeFile, pkEntity: number, token = '' ): Promise<IResApi> {

    return new Promise( (resolve) => {

      this.file.resolveLocalFilesystemUrl( uriFile ).then( (entry) => {
  
        (<FileEntry>entry).file( async (file) => {
          // this.readFile(file);
          const resUpload = await this.upload21.uploadDocument( file, entity, pkEntity, doc, token );

          resolve(resUpload);
          
        });
  
      }).catch( (e) => {
  
        resolve({
          ok: false,
          error: {
            message: 'Error al subir documento'
          }
        });
  
      });
    });
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
    this.io. onEmit('occupied-driver', {occupied: false, pkUser: resSingin.data.pkUser}, (resOccupied) => {
      console.log('Cambiando estado conductor', resOccupied);
    });
    await this.uiSvc.onHideLoading();
    this.navCtrl.navigateRoot('welcome');
  }

  onGetError( showError: number ) {

    let arrError = showError === 0 ? ['Cuenta creada exitosamente'] : ['Error ya existe un usuario'];
    
    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError.push('con este nombre de usuario');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrError.push('asociado con este email');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrError.push('se encuentra inactivo');
    }    

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrError = ['Error', 'ya existe un conductor con este nro de documento'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrError = ['Error', 'ya existe un vehículo con este nro de placa'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrError = ['Error', 'Tipo de documento inválido'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 32) {
      arrError = ['Error', 'nacionalidad inválida'];
    }

    return arrError.join(', ');
  }

  ngOnDestroy() {
    this.menuCtrl.swipeGesture(true);

    if (this.driverSbc) {
      this.driverSbc.unsubscribe();
    }
  }

}
