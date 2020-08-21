import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DriverModel } from '../../models/user-driver.model';
import { NgForm } from '@angular/forms';
import { DriverFilesModel, ETypeFile, EEntity } from 'src/app/models/user-driver-files.model';
import * as moment from 'moment';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { UiUtilitiesService } from '../../services/ui-utilities.service';

declare var window: any;

@Component({
  selector: 'app-form-driver',
  templateUrl: './form-driver.component.html',
  styleUrls: ['./form-driver.component.scss'],
})
export class FormDriverComponent implements OnInit {

  @Input() bodyDriver: DriverModel;
  @Input() driverFiles: DriverFilesModel;
  @Output() clickFrmDriver = new EventEmitter<any>();
  
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
  imgValid = ['jpg', 'png', 'jpeg'];
  fileValid = ['pdf'];
  pickerOptLicense: any;
  minYear = moment().year();
  maxValue = moment(`${moment().year() + 7}-12-31`).format('YYYY-MM-DD');
  typeFile = ETypeFile;

  validFiles = false;

  cameraOpt: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  optSlideRecords = {
    slidesPerView: 1.3,
  };

  validLicense = false;
  validPhotoChk = false;
  validCriminalRecord = true;
  validPolicialRecord = true;

  // tslint:disable-next-line: max-line-length
  constructor(private camera: Camera, private sheetCtrl: ActionSheetController, private filePath: FilePath, private uiSvc: UiUtilitiesService) { }

  ngOnInit() {


    this.pickerOptLicense = {
      mode: 'md',
      buttons: [{
        text: 'Cerrar', 
        handler: () => { }
      }, {
        text: 'Aceptar',
        handler: (v: any) => {
          const newDate = moment(`${v.year.value}-${v.month.value}-${v.day.value}`);
          if (!newDate.isValid()) {
            return false;
          }
          this.bodyDriver.dateLicenseExpiration = newDate.format('YYYY-MM-DD');

        }
      }]
    };

  }

  onClickAction(frm: NgForm, action: string) {
    this.clickFrmDriver.emit({
      ok: true,
      frmValid: frm.valid,
      action,
      bodyDriver: this.bodyDriver,
      driverFiles: this.driverFiles
    });
  }

  onChangeIsEmployee() {
    this.driverFiles.onChangeIsEmployee(this.bodyDriver.isEmployee);
    if (this.bodyDriver.isEmployee) {
      this.driverFiles.onUpdateFile(EEntity.driver, ETypeFile.criminalRecord, '', '');
      this.driverFiles.onUpdateFile(EEntity.driver, ETypeFile.policialRecord, '', '');
    }
    else {
      this.driverFiles.onUpdateFile(EEntity.driver, ETypeFile.photoCheck, '', '');
    }

    this.validCriminalRecord = this.bodyDriver.isEmployee;
    this.validPolicialRecord = this.bodyDriver.isEmployee;
    this.validPhotoChk = !this.bodyDriver.isEmployee;

  }

  async onShowSheetImg(typeFile: ETypeFile) {
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
      arrImg = arrImg[arrImg.length - 1].split('?');
      const extension = arrImg[0].toLowerCase();

      if (this.imgValid.indexOf(extension) === -1) {
        this.uiSvc.onShowToast('Solo se permiten imágenes de tipo: ' + this.imgValid.join(', '), 2000);
        return;
      }

      if (typeFile === ETypeFile.license) {
        this.validLicense = true;
      }
      if (typeFile === ETypeFile.photoCheck) {
        this.validPhotoChk = true;
      }
      if (typeFile === ETypeFile.criminalRecord) {
        this.validCriminalRecord = true;
      }
      if (typeFile === ETypeFile.policialRecord) {
        this.validPolicialRecord = true;
      }

      const res = this.driverFiles.onUpdateFile(EEntity.driver, typeFile, imageData, src, false);

      if (!res.ok) {
        console.error('Error al actualizar imagen', res);
      }
      else {
        this.validFiles = this.driverFiles.onVerify(EEntity.driver);
      }

    }, (err) => {
      throw new Error(err);
    });
  }

}
