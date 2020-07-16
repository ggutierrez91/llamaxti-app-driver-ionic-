import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController, PickerController, ActionSheetController, IonSlides, IonContent } from '@ionic/angular';
import { VehicleModel } from '../../models/vehicle.model';
import { VehicleFilesModel, ETypeFile } from '../../models/vehicle-files.model';
import * as moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { VehicleService } from '../../services/vehicle.service';
import { StorageService } from '../../services/storage.service';

declare var window: any;

@Component({
  selector: 'app-vehicle-modal',
  templateUrl: './vehicle-modal.page.html',
  styleUrls: ['./vehicle-modal.page.scss'],
})
export class VehicleModalPage implements OnInit {
  @ViewChild('slideProperty', {static: true}) slideProperty: IonSlides;
  @ViewChild('slideSoat', {static: true}) slideSoat: IonSlides;
  @ViewChild('slideVehicle', {static: true}) slideVehicle: IonSlides;
  @ViewChild('driverContent', {static: true}) content: IonContent;
  @Input() loadData: boolean;

  bodyVehicle: VehicleModel;
  filesVehicle: VehicleFilesModel;
  typeFile = ETypeFile;
  year = moment().year();

  yearValues: any[] = [];
  colorValues: any[] = [];

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

  // tslint:disable-next-line: max-line-length
  constructor(private modalCtrl: ModalController, private pickerCtrl: PickerController, private sheetCtrl: ActionSheetController, private camera: Camera, private uiSvc: UiUtilitiesService, private vehicleSvc: VehicleService, private st: StorageService) { }

  ngOnInit() {
    this.st.onLoadToken();
    this.slideProperty.lockSwipes(true);
    this.slideSoat.lockSwipes(true);
    this.slideVehicle.lockSwipes(true);
    
    this.bodyVehicle = new VehicleModel();
    this.filesVehicle = new VehicleFilesModel();

    this.filesVehicle.onAddFile( ETypeFile.soat, true );
    this.filesVehicle.onAddFile( ETypeFile.propertyCard, true );

    this.filesVehicle.onAddFile( ETypeFile.taxiFrontal, true );
    this.filesVehicle.onAddFile( ETypeFile.taxiBack, true );
    this.filesVehicle.onAddFile( ETypeFile.taxiInterior, true );

    this.onLoadYears();
    this.onLoadColors();

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

          // console.log('fecha exp', newDate.format('YYYY-MM-DD'));
          this.bodyVehicle.dateSoatExpiration = newDate.format('YYYY-MM-DD');

        }
      }]

    };
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

      // console.log(extension);
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

  onNextVehicleTwo() {

    let verifyFiles = false;
    const arrMsg = ['Error'];
    // if (this.filesVehicle.onGetSrc( ETypeFile.soat ) === '') {
    //   verifyFiles = true;
    //   arrMsg.push('el soat es requerido');
    // }

    // if (this.filesVehicle.onGetSrc( ETypeFile.propertyCard ) === '') {
    //   verifyFiles = true;
    //   arrMsg.push('tarjeta de propieda requerida');
    // }

    if (verifyFiles) {
      return this.uiSvc.onShowToast(arrMsg.join(', '), 4500);
    }

    this.slideVehicle.lockSwipes(false);
    this.slideVehicle.slideNext();
    this.slideVehicle.lockSwipes(true);
    this.content.scrollToTop(50);

  }

  onBackSlide() {
    this.slideVehicle.lockSwipes(false);
    this.slideVehicle.slidePrev();
    this.slideVehicle.lockSwipes(true);
    this.content.scrollToTop(50);
  }

  async onSubmit() {
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

    await this.uiSvc.onShowLoading('Guardando...');

    if (!this.loadData) {
      this.vehicleSvc.onAddVehicle( this.bodyVehicle ).subscribe( async(res) => {
          if (!res.ok) {
            throw new Error( res.error );
          }

          await this.uiSvc.onHideLoading();

          await this.uiSvc.onShowToast( this.onGetError(res.showError) );

          this.onCloseModal();

      });
    }


  }

  onCloseModal() {
    this.modalCtrl.dismiss({ ok: true });
  }

  onGetError( showError: number ) {

    let arrError = showError === 0 ? ['Vehiculo creado exitosamente'] : ['Ya existe un vehículo'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrError.push( 'con este número de placa' );
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrError = [ 'No se encontro registro del conductor' ];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrError.push( 'conductor inactivo' );
    }

    return arrError.join(', ');

  }

  onClose() {
    this.modalCtrl.dismiss();
  }

}
