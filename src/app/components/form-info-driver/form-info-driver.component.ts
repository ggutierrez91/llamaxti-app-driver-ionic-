import { Component, OnInit, ViewChild, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonSlides, ActionSheetController } from '@ionic/angular';
import { DriverModel } from '../../models/user-driver.model';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AuthService } from '../../services/auth.service';
import * as moment from 'moment';
import { DriverFilesModel } from '../../models/user-driver-files.model';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { retry } from 'rxjs/operators';

declare var window: any;

@Component({
  selector: 'app-form-info-driver',
  templateUrl: './form-info-driver.component.html',
  styleUrls: ['./form-info-driver.component.scss'],
})
export class FormInfoDriverComponent implements OnInit, OnDestroy {

  @Input() bodyDriver: DriverModel;
  @Input() driverFiles: DriverFilesModel;
  @Output() clickNext = new EventEmitter<any>();

  imgValid = ['jpg', 'png', 'jpeg'];

  sbcClient: Subscription;
  sbcNationality: Subscription;
  sbcTypeDocument: Subscription;

  dataNationality: any[] = []; // pkNationality, nameCountry, prefixPhone
  dataTypeDocument: any[] = [];

  countryText = 'PER (+51)';
  typeDocText = 'DNI';
  longTypeDoc = 8;
  loadingReniec = false;
  photoValid = false;

  countryAlertOptions: any = {
    subHeader: 'Seleccione su nacionalidad',
    mode: 'ios',
    translucent: true
  };

  typeDocAlertOptions: any = {
    subHeader: 'Seleccione tipo documento',
    mode: 'ios',
    translucent: true
  };

  sexAlertOptions: any = {
    subHeader: 'Seleccione su género',
    mode: 'ios',
    translucent: true
  };

  optCamera: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  minYear = moment().year() - 70;
  maxValue = moment( `${ moment().year() - 21 }-12-31` ).format('YYYY-MM-DD');
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

  pickerOptions: any;

  // tslint:disable-next-line: max-line-length
  constructor( private authSvc: AuthService, private camera: Camera, private sheetCtrl: ActionSheetController, private uiSvc: UiUtilitiesService) { }

  ngOnInit() {
    this.onLoadNationality();
    this.onLoadTypeDoc();
    this.pickerOptions = {
      mode: 'md',
      buttons: [{
        text: 'Cerrar',
        role: 'close',
        handler: () => {}
      }, {
        text: 'Aceptar',
        handler: (v: any) => {
          const newDate = moment( `${ v.year.value }-${ v.month.value  }-${ v.day.value }` );
          if (!newDate.isValid()) {
            return false;
          }
          this.bodyDriver.brithDate = newDate.format('YYYY-MM-DD');
        }
      }]
    };
  }

  onLoadNationality() {
    this.sbcNationality = this.authSvc.onGetNationality( '' )
    .pipe( retry() )
    .subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataNationality = res.data;
    });
  }

  onLoadTypeDoc() {
    this.sbcTypeDocument = this.authSvc.onGetTypeDocument( )
    .pipe( retry() )
    .subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataTypeDocument = res.data;
    });
  }

  onNext() {
    this.clickNext.emit({
      ok: true,
      bodyDriver: this.bodyDriver
    });
  }

  async onShowImgOptions() {
    const actionSheetImg = await this.sheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      animated: true,
      backdropDismiss: true,
      buttons: [{
        icon: 'camera',
        text: 'Tomar foto',
        handler: () => {
          this.optCamera.sourceType = this.camera.PictureSourceType.CAMERA;
          this.onShowCamera();
        }
      }, {
        text: 'Abrir galeria',
        icon: 'image',
        handler: () => {
          this.optCamera.sourceType = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
          this.onShowCamera();
        }
      }]
    });

    await actionSheetImg.present();
  }

  onVerifyDni( event: any ) {
    if (this.bodyDriver.document === '' || this.bodyDriver.document.length !== 8 || this.bodyDriver.fkTypeDocument !== 1) {
      return ;
    }
    this.loadingReniec = true;
    this.sbcClient = this.authSvc.onReniecDni( this.bodyDriver.document )
    .pipe( retry() )
    .subscribe( (res: any) => {
      this.loadingReniec = false;

      if (!res.ok || !res.data.dni || res.data.dni === '') {
        this.bodyDriver.verifyReniec = false;
        this.bodyDriver.name = '';
        this.bodyDriver.surname = '';
        return;
      }

      this.bodyDriver.verifyReniec = true;
      this.bodyDriver.name = res.data.nombres;
      this.bodyDriver.surname = `${ res.data.apellido_paterno} ${ res.data.apellido_materno }`;
    });
  }

  onChangeCountry() {

    const finded = this.dataNationality.find( item => item.pkNationality === this.bodyDriver.fkNationality );
    if (finded) {
      this.countryText = `${ finded.isoAlfaThree } (${ finded.prefixPhone })`;
    }
  }

  onChangeTypeDoc() {
    const finded = this.dataTypeDocument.find( item => item.pkTypeDocument === this.bodyDriver.fkTypeDocument );
    if (finded) {
      this.typeDocText = finded.prefix;
      this.longTypeDoc = Number( finded.longitude );
    }
  }

  onShowCamera() {
    this.camera.getPicture(this.optCamera).then((imageData) => {
      this.bodyDriver.img = imageData;
      const src: string = window.Ionic.WebView.convertFileSrc(imageData);
      let arrImg = src.split('.');
      arrImg = arrImg[ arrImg.length - 1 ].split('?');
      const extension = arrImg[ 0 ].toLowerCase();

      if ( !this.imgValid.includes( extension ) ) {
        this.bodyDriver.img = '';
        this.uiSvc.onShowToast('Solo se permiten imágenes de tipo: ' + this.imgValid.join(', '), 2000);
        return;
      }

      this.bodyDriver.srcImg = src;
      this.photoValid = true;

    }, (err) => {
     throw new Error( err );
    });
  }

  ngOnDestroy() {
    if (this.sbcClient) {
      this.sbcClient.unsubscribe();
    }

    if (this.sbcNationality) {
      this.sbcNationality.unsubscribe();
    }

    if (this.sbcTypeDocument) {
      this.sbcTypeDocument.unsubscribe();
    }
  }

}
