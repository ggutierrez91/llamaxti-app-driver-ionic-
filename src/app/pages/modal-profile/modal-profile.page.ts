import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IProfile } from '../../interfaces/profile.interface';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';
import { ModalController, PickerController, ActionSheetController, IonSlides, IonContent } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { DriverFilesModel, EEntity, ETypeFile } from '../../models/user-driver-files.model';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';

const URI_SERVER = environment.URL_SERVER;
declare var window: any;

@Component({
  selector: 'app-modal-profile',
  templateUrl: './modal-profile.page.html',
  styleUrls: ['./modal-profile.page.scss'],
})
export class ModalProfilePage implements OnInit, OnDestroy {
  @Input() bodyProfile: IProfile;
  @Input() token: string;
  @ViewChild('slideProfile', {static: true}) slideProfile: IonSlides;
  @ViewChild('driverContent', {static: true}) content: IonContent;
  @ViewChild('canvasCriminal') canvasCriminal: ElementRef;
  @ViewChild('canvasPolicial') canvasPolicial: ElementRef;
  
  // @ViewChild('slidePhotoCheck', {static: false}) slidePhotoCheck: IonSlides;

  tdSbc: Subscription;
  natiSbc: Subscription;
  profileSbc: Subscription;
  userSbc: Subscription;

  typeFile = ETypeFile;
  driverFiles: DriverFilesModel;

  dataTypeDoc: any[] = [];
  dataNationality: any[] = [];
  dataPickerSex: any[] = [];

  imgProfile = '';
  imgProfileNew = '';
  longitude = 8;
  imgValid = ['jpg', 'png', 'jpeg'];

  validLicense = true;
  validPhotoChk = false;
  validCriRecord = false;
  validPolRecord = false;

  criIsPdf = false;
  polIsPdf = false;

  fileValid = ['pdf'];

  pickerBirthDate: any;
  pickerLicense: any;
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
  options: CameraOptions = {
    quality: 60,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };
  minYear = moment().year() - 18;
  minYearLic = moment().year();
  maxYearLic = moment().year() + 5;

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

  optSlideRecords = {
    initialSlide: 0,
    slidesPerView: 1.3,
    direction: 'horizontal',
    spaceBetween: 0,
  };
  pathLic = '';
  pathPho = '';
  pathCri = '';
  pathPo = '';

  pathDriver = URI_SERVER + `/Driver/Img/Get/driver/`;

  // tslint:disable-next-line: max-line-length
  constructor( private camera: Camera, private modalCtrl: ModalController, private pickerCtrl: PickerController, private authSvc: AuthService, private sheetCtrl: ActionSheetController, private ui: UiUtilitiesService, private fileChooser: FileChooser, private filePath: FilePath, private userSvc: UserService, private upload: UploadService ) { }

  ngOnInit() {

    this.driverFiles = new DriverFilesModel();
    const pkDriver = this.bodyProfile.pkDriver;
    const imgLic = this.bodyProfile.imgLicense;
    const imgPho = this.bodyProfile.imgPhotoCheck;
    const imgCri = this.bodyProfile.imgCriminalRecord;
    const imgPol = this.bodyProfile.imgPolicialRecord;
    const img = this.bodyProfile.img;

    this.pathLic = this.pathDriver + `${ imgLic }/${ pkDriver }?token=${ this.token }`;
    this.pathPho = this.pathDriver + `${ imgPho }/${ pkDriver }?token=${ this.token }`;
    this.pathCri = this.pathDriver + `${ imgCri }/${ pkDriver }?token=${ this.token }`;
    this.pathPo = this.pathDriver + `${ imgPol }/${ pkDriver }?token=${ this.token }`;

    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.license, true, this.pathLic, this.pathLic );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.photoCheck, true, this.pathPho, this.pathPho );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.criminalRecord, false, this.pathCri, this.pathCri );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.policialRecord, false, this.pathPo, this.pathPo );

    this.slideProfile.lockSwipes(true);
    // this.slidePhotoCheck.lockSwipes(true);
    this.validLicense = imgLic === '' ? false : true;

    if (this.bodyProfile.isEmployee) {
      this.validPhotoChk = imgPho === '' ? false : true;
    } else {
      this.validCriRecord = imgCri === '' ? false : true;
      this.validPolRecord = imgPol === '' ? false : true;

      if (this.validPolRecord) {
        const arrExtCri = imgCri.split('.');
        const extCri = arrExtCri[ arrExtCri.length - 1 ].toLowerCase();
        this.criIsPdf = extCri.trim() === 'pdf' ? true : false;
      }

      if (this.validPolRecord) {
        const arrExtPol = imgPol.split('.');
        const extPol = arrExtPol[ arrExtPol.length - 1 ].toLowerCase();
        this.polIsPdf = extPol.trim() === 'pdf' ? true : false;
      }

    }

    this.imgProfile = URI_SERVER + '/User/Img/Get/' + `${ img || 'xD.png' }?token=${ this.token }`;

    this.onLoadTypeDoc();
    this.onLoadNationality();
    this.dataPickerSex.push({ text: 'MASCULINO', value: 'M' });
    this.dataPickerSex.push({ text: 'FEMENINO', value: 'F' });
    this.dataPickerSex.push({ text: 'OTRO', value: 'O' });

    this.pickerBirthDate = {
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

          this.bodyProfile.brithDate = newDate.format('YYYY-MM-DD');

        }
      }]

    };

    this.pickerLicense = {
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

          this.bodyProfile.dateLicenseExpiration = newDate.format('YYYY-MM-DD');

        }
      }]

    };

  }


  onCloseModal() {
    this.modalCtrl.dismiss({ok: false});
  }

  onLoadTypeDoc() {
    this.tdSbc = this.authSvc.onGetTypeDocument().subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataTypeDoc = res.data;

      const findedTd = this.dataTypeDoc.find( td => td.pkTypeDocument === this.bodyProfile.fkTypeDocument );
      if (findedTd) {
        this.longitude = findedTd.longitude;
      }
    });
  }

  onLoadNationality() {
    this.natiSbc = this.authSvc.onGetNationality().subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataNationality = res.data;
    });
  }

  onNext() {
    this.slideProfile.lockSwipes(false);
    this.slideProfile.slideNext();
    this.slideProfile.lockSwipes(true);
    this.content.scrollToTop(50);
  }

  onBack() {
    this.slideProfile.lockSwipes(false);
    this.slideProfile.slidePrev();
    this.slideProfile.lockSwipes(true);
    this.content.scrollToTop(50);
  }

  async onShowTypeDoc() {

    const pickerTypeDoc = await this.pickerCtrl.create({
      animated: true,
      columns: [{
        name: 'typeDoc',
        options: this.dataTypeDoc
      }],
      buttons: [{
        text: 'Aceptar'
      }]

    });

    await pickerTypeDoc.present();
    pickerTypeDoc.onDidDismiss().then( async data => {
      const col = await pickerTypeDoc.getColumn('typeDoc');
      this.bodyProfile.prefix = col.options[ col.selectedIndex ].text;
      this.bodyProfile.fkTypeDocument = col.options[ col.selectedIndex ].value;

      const findedTd = this.dataTypeDoc.find( td => td.pkTypeDocument === this.bodyProfile.fkTypeDocument );
      if (findedTd) {
        this.longitude = findedTd.longitude;
      }

    });
  }

  async onShowNati() {
    const pickerNati = await this.pickerCtrl.create({
      animated: true,
      columns: [{
        name: 'nationality',
        options: this.dataNationality
      }],
      buttons: [{
        text: 'Aceptar'
      }]

    });

    await pickerNati.present();
    pickerNati.onDidDismiss().then( async data => {
      const col = await pickerNati.getColumn('nationality');
      this.bodyProfile.nameCountry = col.options[ col.selectedIndex ].text;
      // isoAlfaTwo
      this.bodyProfile.fkNationality = col.options[ col.selectedIndex ].value;

      const findedTd = this.dataNationality.find( td => td.pkNationality === this.bodyProfile.fkNationality );
      if (findedTd) {
        this.bodyProfile.prefixPhone = findedTd.prefixPhone;
      }

    });
  }

  async onShowSex() {
    const pickerSex = await this.pickerCtrl.create({
      animated: true,
      columns: [{
        name: 'sex',
        options: this.dataPickerSex
      }],
      buttons: [{
        text: 'Aceptar'
      }]

    });

    await pickerSex.present();
    pickerSex.onDidDismiss().then( async data => {
      const col = await pickerSex.getColumn('sex');
      this.bodyProfile.sex = col.options[ col.selectedIndex ].value;
      this.bodyProfile.sexText = col.options[ col.selectedIndex ].text;
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
          console.log('Abrir cámara');
          this.options.sourceType = this.camera.PictureSourceType.CAMERA;
          this.onShowCamera();
        }
      }, {
        text: 'Abrir galeria',
        icon: 'image',
        handler: () => {
          console.log('Abrir galería');
          this.options.sourceType = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
          this.onShowCamera();
        }
      }]
    });

    await actionSheetImg.present();
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

          this.options.sourceType = this.camera.PictureSourceType.CAMERA;
          this.onShowCameraDriver(typeFile);
        }
      }, {
        text: 'Abrir galeria',
        icon: 'image',
        handler: () => {

          this.options.sourceType = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
          this.onShowCameraDriver(typeFile);
        }
      }]
    });

    await actionSheetImg.present();

  }

  async onShowSheetpDF(typeFile: ETypeFile) {

    let actionSheetImg = await this.sheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      animated: true,
      backdropDismiss: true,
      buttons: [{
        icon: 'camera',
        text: 'Tomar foto',
        handler: () => {

          this.options.sourceType = this.camera.PictureSourceType.CAMERA;
          this.onShowCameraDriver(typeFile);
        }
      }, {
        text: 'Abrir galeria',
        icon: 'image',
        handler: () => {

          this.options.sourceType = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
          this.onShowCameraDriver(typeFile);
        }
      }]
    });

    await actionSheetImg.present();
  }

  onShowCamera() {

    this.camera.getPicture(this.options).then((imageData) => {

     this.imgProfileNew = imageData;
     this.imgProfile = window.Ionic.WebView.convertFileSrc(imageData);

    }, (err) => {
     throw new Error( err );
    });
  }

  onChangeIsEmployee() {

    this.driverFiles.onChangeIsEmployee(this.bodyProfile.isEmployee);
    this.validPhotoChk = this.bodyProfile.imgPhotoCheck === '' ? false : true;
    if (this.bodyProfile.isEmployee) {

      this.driverFiles.onUpdateFile(EEntity.driver, ETypeFile.criminalRecord
                                    , this.pathCri
                                    , this.pathCri
                                    , false
                                    , false );
      this.driverFiles.onUpdateFile(EEntity.driver
                                    , ETypeFile.policialRecord
                                    , this.pathCri
                                    , this.pathCri
                                    , false
                                    , false);
    }
    else {
      this.validCriRecord = this.bodyProfile.imgCriminalRecord === '' ? false : true;
      this.validPolRecord = this.bodyProfile.imgPolicialRecord === '' ? false : true;
      this.driverFiles.onUpdateFile(EEntity.driver
                                    , ETypeFile.photoCheck
                                    , this.pathPho
                                    , this.pathPho
                                    , false
                                    , false);
    }

  }

  onShowCameraDriver( typeFile: ETypeFile ) {

    this.camera.getPicture(this.options).then((imageData) => {

      const src: string = window.Ionic.WebView.convertFileSrc(imageData);
      let arrImg = src.split('.');
      arrImg = arrImg[arrImg.length - 1].split('?');
      const extension = arrImg[0].toLowerCase();

      if (this.imgValid.indexOf(extension) === -1) {
        this.ui.onShowToast('Solo se permiten imágenes de tipo: ' + this.imgValid.join(', '), 2000);
        return;
      }

      if (typeFile === ETypeFile.license) {
        this.validLicense = true;
      }
      if (typeFile === ETypeFile.photoCheck) {
        this.validPhotoChk = true;
      }
      if (typeFile === ETypeFile.criminalRecord) {
        this.validCriRecord = true;
        this.criIsPdf = false;
      }
      if (typeFile === ETypeFile.policialRecord) {
        this.validPolRecord = true;
        this.polIsPdf = false;
      }

      const res = this.driverFiles.onUpdateFile(EEntity.driver, typeFile, imageData, src, false);

      if (!res.ok) {
        console.error('Error al actualizar imagen', res);
      }

    }, (err) => {
      throw new Error(err);
    });

  }

  async onSubmit( frm: NgForm ) {
    console.log(this.bodyProfile);
    console.log(this.driverFiles);
    // tslint:disable-next-line: no-debugger
    debugger;

    if (frm.valid) {
      let resUpImg = {
        ok: false,
        data: [{nameFile: ''}],
        error: null
      };
      await this.ui.onShowLoading('Guardando...');
      this.userSbc =  this.userSvc.onUpdateProfi( this.bodyProfile, this.token ).subscribe( async(res) => {

        if (!res.ok) {
          throw new Error( res.error );
        }

        if (this.imgProfileNew !== '') {
          const resImg = await this.upload.onUploadImg( this.imgProfileNew, this.bodyProfile.pkUser, this.token );

          resUpImg = JSON.parse( resImg.response );
          if (!resUpImg.ok) {
            throw new Error( resUpImg.error );
          }
        }

        let resDocsJson: any;
        const arrFilesUploaded: string[] = [];

        this.driverFiles.filesDriver.forEach( async (item) => {
            if (item.changeed) {
              const resDoc = await this.upload.onUploadDocuments(item.pathFile
                                                                , item.entity
                                                                , this.bodyProfile.pkDriver
                                                                , item.typeFile
                                                                , this.token
                                                                , item.isPdf);
              resDocsJson = JSON.parse( resDoc.response );
              if (!resDocsJson.ok) {
                throw new Error( resDocsJson.error );
              }
              arrFilesUploaded.push( `Se subio archivo ${ item.typeFile }` );
            }
        });
        await this.ui.onHideLoading();
        this.modalCtrl.dismiss({
          ok: true,
          okUpload: resUpImg.ok,
          data: this.bodyProfile,
          newImg: resUpImg.data[0].nameFile,
          arrFilesUploaded
        });
        console.table(arrFilesUploaded);

      });
    }
  }

  onGetError( showError: number ) {
    let arrErr = showError === 0 ? ['Se actualizó el perfil'] : ['Error'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('No se encontró registro');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('cuenta pendiente de verificación');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('cuenta inactiva');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr = ['No se encontró usuario'];
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErr = ['No se encontró conductor'];
    }

    return arrErr.join(', ');

  }

  ngOnDestroy() {
    this.tdSbc.unsubscribe();
    this.natiSbc.unsubscribe();
    if (this.profileSbc) {
      this.profileSbc.unsubscribe();
    }

    if (this.userSbc) {
      this.userSbc.unsubscribe();
    }

  }

}
