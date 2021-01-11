import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ModalController, PickerController, ActionSheetController, IonSlides, IonContent } from '@ionic/angular';
import { VehicleModel } from '../../models/vehicle.model';
import { VehicleFilesModel, ETypeFile } from '../../models/vehicle-files.model';
import * as moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { VehicleService } from '../../services/vehicle.service';
import { StorageService } from '../../services/storage.service';
import IVehicle from '../../interfaces/vehicle.interface';
import { environment } from '../../../environments/environment';
import { IResApi } from '../../interfaces/response-api.interface';
import { EEntity } from 'src/app/models/user-driver-files.model';
import { Subscription } from 'rxjs';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Upload21Service } from 'src/app/services/upload21.service';

const URI_SERVER = environment.URL_SERVER;
declare var window: any;

@Component({
  selector: 'app-vehicle-modal',
  templateUrl: './vehicle-modal.page.html',
  styleUrls: ['./vehicle-modal.page.scss'],
})
export class VehicleModalPage implements OnInit, OnDestroy {

  // @ViewChild('slideVehicle', {static: true}) slideVehicle: IonSlides;
  @ViewChild('driverContent', {static: true}) content: IonContent;
  @Input() loadData: boolean;
  @Input() data: IVehicle;
  @Input() token: string;

  bodyVehicle: VehicleModel;
  filesVehicle: VehicleFilesModel;
  vhSbc: Subscription;
  typeFile = ETypeFile;
  year = moment().year();

  yearValues: any[] = [];
  colorValues: any[] = [];

  loading = false;

  imgValid = ['jpg', 'png', 'jpeg'];

  validFiles = false;

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

  cameraOpt: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];
  minYear = moment().year();
  maxValue = moment( `${ moment().year() + 2 }-12-31` ).format('YYYY-MM-DD');

  pickerOptLicense: any;
  optSlideRecords = {
    slidesPerView: 1.3
  };
  pathDriver = URI_SERVER + `/Driver/Img/Get/vehicle/`;

  // tslint:disable-next-line: max-line-length
  constructor(private modalCtrl: ModalController, private pickerCtrl: PickerController, private sheetCtrl: ActionSheetController, private camera: Camera, private uiSvc: UiUtilitiesService, private vehicleSvc: VehicleService, public st: StorageService, private upload21: Upload21Service, private file: File) { }

  ngOnInit() {

    // this.slideProperty.lockSwipes(true);
    // this.slideSoat.lockSwipes(true);
    // this.slideVehicle.lockSwipes(true);

    this.bodyVehicle = new VehicleModel();
    this.filesVehicle = new VehicleFilesModel();

    this.onLoadInit();

    // this.widthDevice = this.device.width;

  }

  async onLoadInit() {
    await this.uiSvc.onShowLoading('Espere...');
    this.st.onLoadToken().then( async() => {

      this.onLoadFiles();

      this.onLoadYears();
      this.onLoadColors();

      if (this.loadData) {

        let nameColor = '';

        switch (this.data.color) {
          case 'BLUE':
            nameColor = 'AZUL';
            break;
            case 'RED':
            nameColor = 'ROJO';
            break;
            case 'BLACK':
            nameColor = 'NEGRO';
            break;
            case 'WHITE':
            nameColor = 'BLANCO';
            break;
            case 'GRAY':
            nameColor = 'GRIS';
            break;
            case 'YELLOW':
            nameColor = 'AMARILLO';
            break;
            case 'BROWN':
            nameColor = 'MARRON';
            break;
            case 'GREEN':
            nameColor = 'VERDE';
            break;
            case 'BEIGE':
            nameColor = 'BEIGE';
            break;
    
          default:
            break;
        }

        this.bodyVehicle.pkVehicle = this.data.pkVehicle;
        this.bodyVehicle.numberPlate = this.data.numberPlate;
        this.bodyVehicle.color = this.data.color;
        this.bodyVehicle.colorEs = nameColor;
        this.bodyVehicle.year = this.data.year;
        this.bodyVehicle.isProper = Boolean( this.data.isProper );
        this.bodyVehicle.dateSoatExpiration = this.data.dateSoatExpiration;

      }

      this.pickerOptLicense = {
        mode: 'md',
        buttons: [{
          text: 'Cerrar',
          handler: () => {}
        }, {
          text: 'Aceptar',
          handler: (v: any) => {
            const newDate = moment( `${ v.year.value }-${ v.month.value  }-${ v.day.value }` );
            if (!newDate.isValid()) {
              return false;
            }
            this.bodyVehicle.dateSoatExpiration = newDate.format('YYYY-MM-DD');
          }
        }]
  
      };
      await this.uiSvc.onHideLoading();
    });
  }

  onLoadFiles() {
    const path = this.pathDriver + `${ this.data.pkVehicle }/`;
    const param = `?idDriver=${ this.data.fkDriver || 0 }&token=${ this.st.token }`;
    let pathSoat =  path + this.data.imgSoat + param;
    let pathPropertyCard =  path + this.data.imgPropertyCard + param;
    let pathFrontal =  path + this.data.imgTaxiFrontal + param;
    let pathBack =  path + this.data.imgTaxiBack + param;
    let pathInterior =  path + this.data.imgTaxiInterior + param;

    if (!this.loadData) {
      pathSoat = '';
      pathPropertyCard = '';
      pathFrontal = '';
      pathBack = '';
      pathInterior = '';
    }

    this.filesVehicle.onAddFile( ETypeFile.soat, true, pathSoat, pathSoat );
    this.filesVehicle.onAddFile( ETypeFile.propertyCard, true, pathPropertyCard, pathPropertyCard );

    this.filesVehicle.onAddFile( ETypeFile.taxiFrontal, true, pathFrontal, pathFrontal );
    this.filesVehicle.onAddFile( ETypeFile.taxiBack, true, pathBack, pathBack );
    this.filesVehicle.onAddFile( ETypeFile.taxiInterior, true, pathInterior, pathInterior );
  }

  onLoadYears() {
    const lastYear = this.year - 15;

    for (let index = lastYear; index <= this.year; index++) {
      this.yearValues.push( { text: index, value: index } );
    }
  }

  onLoadColors() {

    this.colorValues.push( { text: 'AZUL', value: 'BLUE' }  );
    this.colorValues.push( { text: 'ROJO', value: 'RED' }  );
    this.colorValues.push( { text: 'NEGRO', value: 'BLACK' }  );
    this.colorValues.push( { text: 'BLANCO', value: 'WHITE' }  );
    this.colorValues.push( { text: 'GRIS', value: 'GRAY' }  );
    this.colorValues.push( { text: 'AMARILLO', value: 'YELLOW' }  );
    this.colorValues.push( { text: 'MARRÓN', value: 'BROWN' }  );
    this.colorValues.push( { text: 'VERDE', value: 'GREEN' }  );
    this.colorValues.push( { text: 'BEIGE', value: 'BEIGE' }  );
  }

  async onShowPickerYear() {

    const pickerYear = await this.pickerCtrl.create({
      // mode: 'ios',
      // animated: true,
      columns: [{
        name: 'year',
        options: this.yearValues
      }],
      buttons: [{
        text: 'Ok'
      }],

    });

    await pickerYear.present();
    pickerYear.onDidDismiss().then( async data => {
      const col = await pickerYear.getColumn('year');
      this.bodyVehicle.year = col.options[ col.selectedIndex ].value;
    });

  }

  async onShowPickerColor() {

    const pickerColor = await this.pickerCtrl.create({
      // mode: 'ios',
      // animated: true,
      columns: [{
        name: 'color',
        options: this.colorValues
      }],
      buttons: [{
        text: 'Ok'
      }],

    });

    await pickerColor.present();
    pickerColor.onDidDismiss().then( async data => {
      const col = await pickerColor.getColumn('color');
      this.bodyVehicle.color = col.options[ col.selectedIndex ].value;
      this.bodyVehicle.colorEs = col.options[ col.selectedIndex ].text;
    });

  }

  async onShowSheetImg( typeFile: ETypeFile, allowPDF = false ) {
    const actionSheetImg = await this.sheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      animated: true,
      backdropDismiss: true,
      buttons: [{
        icon: 'camera',
        text: 'Tomar foto',
        handler: () => {

          this.cameraOpt.sourceType = this.camera.PictureSourceType.CAMERA;
          this.onShowCamera(typeFile);

        }
      }, {
        text: 'Abrir galeria',
        icon: 'image',
        handler: () => {

          this.cameraOpt.sourceType = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
          this.onShowCamera(typeFile);

        }
      }]
    });

    await actionSheetImg.present();
  }

  onShowCamera(typeFile: ETypeFile) {
    this.camera.getPicture(this.cameraOpt).then((imageData) => {

      const src: string = window.Ionic.WebView.convertFileSrc(imageData);
      let arrImg = src.split('.');
      arrImg = arrImg[ arrImg.length - 1 ].split('?');
      const extension = arrImg[ 0 ].toLowerCase();

      if (this.imgValid.indexOf( extension ) === -1) {
        this.uiSvc.onShowToast('Solo se permiten imágenes de tipo: ' + this.imgValid.join(', '), 2000);
        return;
      }

      const res = this.filesVehicle.onUpdateFile( typeFile, imageData, src );
      this.validFiles = true;

      if (!res.ok) {
        console.error('Error al actualizar imagen', res);
      }

    }, (err) => {
      console.error('error al abrir camara', err);
    }).catch(e => {
      throw new Error(e);
    });
  }

  // onNextVehicleTwo() {
  //   this.loading = true;
  //   this.slideVehicle.lockSwipes(false);
  //   this.slideVehicle.slideNext().then( async () => {
  //     await this.slideVehicle.lockSwipes(true);
  //     await this.content.scrollToTop(50);
  //     this.loading = false;
  //   });

  // }

  // onBackSlide() {
  //   this.loading = true;
  //   this.slideVehicle.lockSwipes(false);
  //   this.slideVehicle.slidePrev().then( async () => {
  //     await this.content.scrollToTop(50);
  //     await this.slideVehicle.lockSwipes(true);
  //     this.loading = false;
  //   });
  // }

  onSubmit() {
    let verifyFiles = false;
    const arrMsg = ['Error'];
    if (this.filesVehicle.onGetSrc( ETypeFile.taxiFrontal ) === '') {
      verifyFiles = true;
      arrMsg.push('foto frontal requerida');
    }

    if (this.filesVehicle.onGetSrc( ETypeFile.taxiBack ) === '') {
      verifyFiles = true;
      arrMsg.push('foto trasera requerida');
    }

    if (this.filesVehicle.onGetSrc( ETypeFile.taxiInterior ) === '') {
      verifyFiles = true;
      arrMsg.push('foto interior requerida');
    }

    if (verifyFiles) {
      return this.uiSvc.onShowToast(arrMsg.join(', '), 4500);
    }

    this.uiSvc.onShowLoading('Guardando...');

    if (!this.loadData) {

      this.onAddVehicle();

    } else {

      this.onUpdateVehicle();

    }

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

  onAddVehicle() {
    this.vhSbc = this.vehicleSvc.onAddVehicle( this.bodyVehicle )
    // .pipe( retry() )
    .subscribe( async ( res ) => {
        if (!res.ok) {
          throw new Error( res.error );
        }
        if (res.showError === 0) {
          const arrFilesUploaded: any[] = [];

          await Promise.all( this.filesVehicle.filesVehicle.map( async (item) => {

            if (item.pathFile !== '') {

              const resUpDocs = await this.onSendDocument( item.pathFile
                                              , EEntity.vehicle
                                              , item.typeFile
                                              , res.data.pkVehicleDriver
                                              , this.token );
              if (!resUpDocs.ok) {
                throw new Error( resUpDocs.error );
              }
              arrFilesUploaded.push( `Se subio archivo ${ item.typeFile }` );
            }

          }) );

          await this.uiSvc.onHideLoading();

          await this.uiSvc.onShowToast( this.onGetError(res.showError) );
          await this.modalCtrl.dismiss({
            ok: true,
            arrUpload: arrFilesUploaded,
            data: res
          }, 'inserted');
  
        } else {
          await this.uiSvc.onHideLoading();
          await this.uiSvc.onShowToast( this.onGetError(res.showError) );
        }

    });
  }

  onUpdateVehicle() {
    this.vhSbc = this.vehicleSvc.onUpdateVehicle( this.bodyVehicle )
    // .pipe( retry() )
    .subscribe( async ( res ) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      if (res.showError === 0) {
        const arrFilesUploaded: any[] = [];

        await Promise.all( this.filesVehicle.filesVehicle.map( async (item) => {

          // console.log('file vehicle', item);
          if (item.changed) {
  
            const resUpDocs = await this.onSendDocument( item.pathFile
                                            , EEntity.vehicle
                                            , item.typeFile
                                            , this.bodyVehicle.pkVehicle
                                            , this.st.token );
            if (!resUpDocs.ok) {
              throw new Error( resUpDocs.error );
            }
            arrFilesUploaded.push( `Se subio archivo ${ item.typeFile }` );
          }
        }) );

        await this.uiSvc.onHideLoading();

        await this.uiSvc.onShowToast( this.onGetError(res.showError) );
        await this.modalCtrl.dismiss({
          ok: true,
          arrUpload: arrFilesUploaded,
          data: res
        }, 'updated');


      } else {
        await this.uiSvc.onHideLoading();
        await this.uiSvc.onShowToast( this.onGetError(res.showError) );
      }

    });
  }

  onCloseModal() {
    this.modalCtrl.dismiss( {ok: false}, 'cancel');
  }

  onGetError( showError: number ) {

    let arrError = showError === 0 ? ['Vehiculo creado exitosamente'] : ['Alerta!'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError.push( 'ya existe un vehículo con esta placa' );
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrError = [ 'Alerta!', 'No se encontro registro del conductor' ];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrError.push( 'conductor inactivo' );
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrError = [ 'Alerta!', 'Solo puede tener 03 vehículos como máximo' ];
    }

    return arrError.join(', ');

  }

  ngOnDestroy() {
    if (this.vhSbc) {
      this.vhSbc.unsubscribe();
    }
  }

}
