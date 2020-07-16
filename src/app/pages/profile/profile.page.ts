import { Component, OnInit, OnDestroy } from '@angular/core';
import { IProfile } from '../../interfaces/profile.interface';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from '../../services/user.service';
import { ModalProfilePage } from '../modal-profile/modal-profile.page';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  profileSbc: Subscription;
  dataProfile: IProfile = {
    yearsOld: 0,
    img: 'xD.jpg',
    aboutMe: ''
  };

  pathImg = URI_SERVER + '/User/Img/Get/';
  pathDriver = URI_SERVER + `/Driver/Img/Get/driver/`;
  loading = false;

  pathLicense = '';
  pathPolicialRecord = '';
  pathCriminalRecord = '';
  pathCheck = '';

  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private ui: UiUtilitiesService, private modalCtrl: ModalController, private userSvc: UserService ) { }

  ngOnInit() {
    this.loading = true;
    this.ui.onShowLoading('Espere...');

    this.st.onLoadToken().then( async () => {
      this.loading = false;

      this.onLoadProfile();

    }).catch( e => console.error('Error al cargar storage', e ) );

  }

  onLoadProfile() {
    this.profileSbc = this.userSvc.onGetProfile().subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      console.log(res);

      await this.ui.onHideLoading();
      this.dataProfile = res.data;
      this.dataProfile.sexText = 'MASCULINO';
      this.pathLicense = this.pathDriver + `${ this.dataProfile.imgLicense }/${ this.dataProfile.pkDriver  }?token=${ this.st.token }`;
      this.pathPolicialRecord = this.pathDriver + `${ this.dataProfile.imgPolicialRecord }/${ this.dataProfile.pkDriver  }?token=${ this.st.token }`;
      this.pathCriminalRecord = this.pathDriver + `${ this.dataProfile.imgCriminalRecord }/${ this.dataProfile.pkDriver  }?token=${ this.st.token }`;
      this.pathCheck = this.pathDriver + `${ this.dataProfile.imgPhotoCheck }/${ this.dataProfile.pkDriver  }?token=${ this.st.token }`;

      // this.dataProfile.brithDate = moment
      this.dataProfile.dateLicenseExpiration = moment( this.dataProfile.dateLicenseExpiration ).format('YYYY-MM-DD');

      if (this.dataProfile.brithDate) {
          this.dataProfile.brithDate = moment( this.dataProfile.brithDate ).format('YYYY-MM-DD');
      }
      if (this.dataProfile.sex !== 'M') {
        this.dataProfile.sexText = this.dataProfile.sex === 'F' ? 'FEMENINO' : 'OTRO';
      }

    });
  }

  async onShowEditProfile() {
    const modelProf = await this.modalCtrl.create({
      animated: true,
      component: ModalProfilePage,
      componentProps: {
        bodyProfile: this.dataProfile,
        token: this.st.token
      }
    });

    await modelProf.present();

    await modelProf.present();
    modelProf.onDidDismiss().then( (res: any) => {
      if (res.ok) {
        this.dataProfile = res.data;
      }
    });
  }

  ngOnDestroy() {
    this.profileSbc.unsubscribe();
  }

}
