import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DriverModel } from '../../models/user-driver.model';
import { DriverFilesModel, ETypeFile, EEntity } from '../../models/user-driver-files.model';
import * as moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, IonSlides } from '@ionic/angular';
import { FilePath } from '@ionic-native/file-path/ngx';
import { NgForm } from '@angular/forms';
import { UiUtilitiesService } from '../../services/ui-utilities.service';

declare var window: any;

@Component({
  selector: 'app-form-vehicle',
  templateUrl: './form-vehicle.component.html',
  styleUrls: ['./form-vehicle.component.scss'],
})
export class FormVehicleComponent implements OnInit {

  @Input() bodyDriver: DriverModel;
  @Input() driverFiles: DriverFilesModel;
  @Output() clickActionVehicle = new EventEmitter<any>();

  typeFile = ETypeFile;

  optColorOptions: any = {
    header: 'Color',
    subHeader: 'Seleccione color del vehículo'
  };

  imgValid = ['jpg', 'png', 'jpeg'];

  year = moment().year();

  yearValues: number[] = [];

  cameraOpt: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  validFiles = false;

  // tslint:disable-next-line: max-line-length
  constructor(private camera: Camera, private sheetCtrl: ActionSheetController, private filePath: FilePath, private uiSvc: UiUtilitiesService) { }

  ngOnInit() {
    this.onLoadYears();
  }

  onLoadYears() {
    const lastYear = this.year - 15;

    for (let index = lastYear; index <= this.year; index++) {
      this.yearValues.push( index );
    }
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

      if (this.imgValid.indexOf( extension ) === -1) {
        this.uiSvc.onShowToast('Solo se permiten imágenes de tipo: ' + this.imgValid.join(', '), 2000);
        return;
      }

      const res = this.driverFiles.onUpdateFile( EEntity.vehicle, typeFile, imageData, src );
      this.validFiles = true;

      if (!res.ok) {
        console.error('Error al actualizar imagen', res);
      }

    }, (err) => {
     throw new Error( err );
    });
  }

  onClickAction( frm: NgForm, action: string ) {
    this.clickActionVehicle.emit({
      ok: true,
      frmValid: frm.valid,
      action,
      bodyDriver: this.bodyDriver,
      driverFiles: this.driverFiles
    });
  }

}
