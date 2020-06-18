import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DriverFilesModel, ETypeFile, EEntity } from '../../models/user-driver-files.model';
import * as moment from 'moment';
import { DriverModel } from '../../models/user-driver.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, IonSlides } from '@ionic/angular';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
declare var window: any;
@Component({
  selector: 'app-form-vehicle-two',
  templateUrl: './form-vehicle-two.component.html',
  styleUrls: ['./form-vehicle-two.component.scss'],
})
export class FormVehicleTwoComponent implements OnInit {
  @Input() bodyDriver: DriverModel;
  @Input() driverFiles: DriverFilesModel;
  @Output() clickNextBackVehicleTwo = new EventEmitter<any>();
  @ViewChild('slideSoat', {static: true}) slideSoat: IonSlides;
  @ViewChild('slideFrontalTaxi', {static: true}) slideFrontalTaxi: IonSlides;
  @ViewChild('slideBackTaxi', {static: true}) slideBackTaxi: IonSlides;
  @ViewChild('slideInTaxi', {static: true}) slideInTaxi: IonSlides;

  imgValid = ['jpg', 'png', 'jpeg'];

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

  cameraOpt: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  validFiles = false;

  soatValid = false;
  vehicleOneValid = false;
  vehicleTwoValid = false;
  vehicleIntrnalValid = false;

  constructor(private camera: Camera, private sheetCtrl: ActionSheetController, private uiSvc: UiUtilitiesService) { }

  ngOnInit() {

    this.slideSoat.lockSwipes(true);
    // this.slideFrontalTaxi.lockSwipes(true);
    // this.slideBackTaxi.lockSwipes(true);
    // this.slideInTaxi.lockSwipes(true);
    
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
          this.bodyDriver.dateSoatExpiration = newDate.toISOString();

        }
      }]

    };

  }

  async onShowSheetImg( typeFile: ETypeFile ) {
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

      console.log(extension);
      if (this.imgValid.indexOf( extension ) === -1) {
        this.uiSvc.onShowToast('Solo se permiten imágenes de tipo: ' + this.imgValid.join(', '), 2000);
        return;
      }

      const res = this.driverFiles.onUpdateFile( EEntity.vehicle, typeFile, imageData, src );
      if (ETypeFile.soat === typeFile) {
        this.soatValid = true;
      }
      if (ETypeFile.taxiFrontal === typeFile) {
        this.vehicleOneValid = true;
      }
      if (ETypeFile.taxiBack === typeFile) {
        this.vehicleTwoValid = true;
      }
      if (ETypeFile.taxiInterior === typeFile) {
        this.vehicleIntrnalValid = true;
      }


      if (!res.ok) {
        console.error('Error al actualizar imagen', res);
      }

    }, (err) => {
     throw new Error( err );
    });
  }

  onClickAction(action: string) {
  
    this.clickNextBackVehicleTwo.emit({
      ok: true,
      frmValid: true,
      action,
      bodyDriver: this.bodyDriver,
      driverFiles: this.driverFiles,

    });
  }

}
