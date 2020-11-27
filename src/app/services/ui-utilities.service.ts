import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiUtilitiesService {

  constructor( private loadingCtrl: LoadingController, private alertCtrl: AlertController, private toastCtrl: ToastController ) { }


  async onShowLoading( message: string ) {
    const loading = await this.loadingCtrl.create({
      mode: 'ios',
      message,
      spinner: 'bubbles',
      animated: true
    });

    await loading.present();
  }

  async onHideLoading() {
    await this.loadingCtrl.dismiss();
  }

  async onShowAlert(message: string) {

    const alert = await this.alertCtrl.create({
      header: 'Mensaje al usuario',
      message,
      mode: 'ios',
      translucent: true,
      animated: true,
      buttons: [{
        text: 'Aceptar',
        handler: () => {

        }
      }]
    });

    await alert.present();

  }

  async onShowToast( message: string, duration = 1000 ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      translucent: true,
      color: 'light',
      animated: true,
      mode: 'ios',
      buttons: [{
        text: 'Ok',
        role: 'close',
        handler: () => {
        }
      }]
    });

    await toast.present();
  }

  async onShowToastTop( message: string, duration = 1000 ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      translucent: true,
      color: 'light',
      animated: true,
      mode: 'ios',
      position: 'top',
      buttons: [{
        text: 'Ok',
        role: 'close',
        handler: () => {
        }
      }]
    });

    await toast.present();
  }

}
