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
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { Upload21Service } from '../../services/upload21.service';
import { IResApi } from '../../interfaces/response-api.interface';
import { File, FileEntry } from '@ionic-native/file/ngx';

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
  validPhotoChk = true;
  validCriRecord = true;
  validPolRecord = true;

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

  resJson: IResApi = {
    ok: false,
    data: [{nameFile: ''}]
  };

  // tslint:disable-next-line: max-line-length
  constructor( private camera: Camera, private modalCtrl: ModalController, private pickerCtrl: PickerController, private authSvc: AuthService, private sheetCtrl: ActionSheetController, private ui: UiUtilitiesService, private userSvc: UserService, private upload: UploadService, private upload21: Upload21Service, private file: File ) { }

  ngOnInit() {

    // this.st.onLoadData();

    this.driverFiles = new DriverFilesModel();
    const pkDriver = this.bodyProfile.pkDriver;
    const imgLic = this.bodyProfile.imgLicense;
    const imgPho = this.bodyProfile.imgPhotoCheck;
    const imgCri = this.bodyProfile.imgCriminalRecord;
    const imgPol = this.bodyProfile.imgPolicialRecord;
    const img = this.bodyProfile.img;

    this.pathLic = this.pathDriver + `${ pkDriver }/${ imgLic }?token=${ this.token }`;
    this.pathPho = this.pathDriver + `${ pkDriver }/${ imgPho }?token=${ this.token }`;
    this.pathCri = this.pathDriver + `${ pkDriver }/${ imgCri }?token=${ this.token }`;
    this.pathPo = this.pathDriver + `${ pkDriver }/${ imgPol }?token=${ this.token }`;

    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.license, true, this.pathLic, this.pathLic );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.photoCheck, true, this.pathPho, this.pathPho );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.criminalRecord, false, this.pathCri, this.pathCri );
    this.driverFiles.onAddFile( EEntity.driver, ETypeFile.policialRecord, false, this.pathPo, this.pathPo );

    this.slideProfile.lockSwipes(true);
    this.validLicense = imgLic === '' ? false : true;

    if (this.bodyProfile.isEmployee) {
      this.validPhotoChk = imgPho === '' ? false : true;
    } else {
      this.validCriRecord = imgCri === '' ? false : true;
      this.validPolRecord = imgPol === '' ? false : true;
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
    this.tdSbc = this.authSvc.onGetTypeDocument()
    // .pipe( retry() )
    .subscribe( (res) => {
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
    this.natiSbc = this.authSvc.onGetNationality()
    // .pipe( retry() )
    .subscribe( (res) => {
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

    if (this.bodyProfile.verifyReniec) {
      return false;
    }

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
          this.options.sourceType = this.camera.PictureSourceType.CAMERA;
          this.onShowCamera();
        }
      }, {
        text: 'Abrir galeria',
        icon: 'image',
        handler: () => {
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

  onShowCamera() {

    this.camera.getPicture(this.options).then((imageData) => {

     this.imgProfileNew = imageData;
     this.imgProfile = window.Ionic.WebView.convertFileSrc(imageData);

    }, (err) => {
     throw new Error( err );
    });
  }

  onChangeIsEmployee() {
    const pkDriver = this.bodyProfile.pkDriver;
    const imgPho = this.bodyProfile.imgPhotoCheck;
    const imgCri = this.bodyProfile.imgCriminalRecord;
    const imgPol = this.bodyProfile.imgPolicialRecord;

    this.driverFiles.onChangeIsEmployee(this.bodyProfile.isEmployee);
    this.validPhotoChk = imgPho === '' ? false : true;
    this.validCriRecord = imgCri === '' ? false : true;
    this.validPolRecord = imgPol === '' ? false : true;

    if (this.bodyProfile.isEmployee) {
      this.pathCri = this.pathDriver + `${ pkDriver }/${ imgCri }?token=${ this.token }`;
      this.pathPo = this.pathDriver + `${ pkDriver }/${ imgPol }?token=${ this.token }`;

      this.driverFiles.onUpdateFile(EEntity.driver, ETypeFile.criminalRecord
                                    , this.pathCri
                                    , this.pathCri
                                    , false
                                    , false );

      this.driverFiles.onUpdateFile(EEntity.driver
                                    , ETypeFile.policialRecord
                                    , this.pathPo
                                    , this.pathPo
                                    , false
                                    , false);
                                  }
    else {

      this.pathPho = this.pathDriver + `${ pkDriver }/${ imgPho }?token=${ this.token }`;
      this.driverFiles.onUpdateFile(EEntity.driver
                                    , ETypeFile.photoCheck
                                    , this.pathPho
                                    , this.pathPho
                                    , false
                                    , false);
    }

  }

  onShowCameraDriver( typeFile: ETypeFile ) {

    this.camera.getPicture(this.options).then((path) => {

      const src: string = window.Ionic.WebView.convertFileSrc(path);
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
      }
      if (typeFile === ETypeFile.policialRecord) {
        this.validPolRecord = true;
      }

      const res = this.driverFiles.onUpdateFile(EEntity.driver, typeFile, path, src, false);

      if (!res.ok) {
        console.error('Error al actualizar imagen', res);
      }

    }, (err) => {
      throw new Error(err);
    });

  }

  async onSubmit( frm: NgForm ) {

    if (frm.valid) {
      
      await this.ui.onShowLoading('Guardando...');
      this.bodyProfile.nameComplete = `${ this.bodyProfile.surname }, ${ this.bodyProfile.name }`;
      this.userSbc =  this.userSvc.onUpdateProfi( this.bodyProfile, this.token )
      // .pipe( retry() )
      .subscribe( async(res) => {

        if (!res.ok) {
          throw new Error( res.error );
        }

        // this.st.dataUser.nameComplete = this.bodyProfile.nameComplete;

        if (this.imgProfileNew !== '') {
          
          await this.onSendUpload( this.imgProfileNew );

        }

        const arrFilesUploaded: any[] = [];

        await Promise.all( this.driverFiles.filesDriver.map( async (item) => {
          if (item.changeed) {
            const resDoc = await this.onSendDocument(item.pathFile
                                                      , item.entity
                                                      , item.typeFile );
            // resDocsJson = JSON.parse( resDoc.response );
            if (!resDoc.ok) {
              console.error( 'Error al subir imagen', resDoc.error );
              return;
            }

            if (item.typeFile === this.typeFile.license ) {
              this.bodyProfile.imgLicense = resDoc.newFile;
            }

            if (item.typeFile === this.typeFile.photoCheck ) {
              this.bodyProfile.imgPhotoCheck = resDoc.newFile;
            }
            if (item.typeFile === this.typeFile.criminalRecord ) {
              this.bodyProfile.imgCriminalRecord = resDoc.newFile;
            }
            if (item.typeFile === this.typeFile.policialRecord ) {
              this.bodyProfile.imgPolicialRecord = resDoc.newFile;
            }

            arrFilesUploaded.push( {
              img: resDoc.newFile,
              doc: resDoc.document,
              msg: `Se subio archivo ${ item.typeFile }`
            });

          }

        }));

        await this.ui.onHideLoading();
        this.modalCtrl.dismiss({
          ok: true,
          okUpload: this.resJson.ok,
          data: this.bodyProfile,
          newImg: this.resJson.data[0].nameFile,
          arrFilesUploaded
        });
        // console.table(arrFilesUploaded);

      });
    }
  }

  onSendUpload( uriFile: string ): Promise<any> {

    return new Promise( (resolve) => {

      this.file.resolveLocalFilesystemUrl( uriFile ).then( (entry) => {
  
        (<FileEntry>entry).file( async (file) => {
          // this.readFile(file);
          const resUpload = await this.upload21.uploadImage( file, this.bodyProfile.pkUser, this.token );

          console.log('response upload', resUpload);
          this.resJson = resUpload;
          if (this.resJson.ok) {
            this.bodyProfile.img = this.resJson.data[0].nameFile;
          }

          resolve(true);
          
        });
  
      }).catch( (e) => {
  
        resolve(false);
  
      });
    });
  }

  onSendDocument( uriFile: string, entity: EEntity, doc: ETypeFile ): Promise<IResApi> {

    return new Promise( (resolve) => {

      this.file.resolveLocalFilesystemUrl( uriFile ).then( (entry) => {
  
        (<FileEntry>entry).file( async (file) => {
          // this.readFile(file);
          const resUpload = await this.upload21.uploadDocument( file, entity, this.bodyProfile.pkDriver, doc, this.token );

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

  onGetError( showError: number ) {
    let arrErr = showError === 0 ? ['Se actualizó el perfil'] : ['Alerta'];

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
