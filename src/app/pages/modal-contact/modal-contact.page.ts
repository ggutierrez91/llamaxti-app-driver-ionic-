import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ContactModel } from '../../models/contact.model';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContactsService } from '../../services/contacts.service';
import { IContact } from '../../interfaces/contact.interface';
import { retry } from 'rxjs/operators';

@Component({
  selector: 'app-modal-contact',
  templateUrl: './modal-contact.page.html',
  styleUrls: ['./modal-contact.page.scss'],
})
export class ModalContactPage implements OnInit, OnDestroy {
  @Input() loadData: boolean;
  @Input() title: string;
  @Input() token: string;
  @Input() bodyContact: ContactModel;
  @Input() dataNationality: any[];

  addSbc: Subscription;
  updateSbc: Subscription;
  delSbc: Subscription;

  countryAlertOptions: any = {
    subHeader: 'Seleccione su nacionalidad',
    mode: 'ios',
    translucent: true
  };

  countryText = 'PER +51';

  pkContactDisposal = 0;

  // tslint:disable-next-line: max-line-length
  constructor(private modalCtrl: ModalController, private contacSvc: ContactsService, private ui: UiUtilitiesService, private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  onChangeCountry() {

    const finded = this.dataNationality.find( item => item.pkNationality === this.bodyContact.fkNationality );
    if (finded) {
      this.countryText = `${ finded.isoAlfaThree } ${ finded.prefixPhone }`;
      this.bodyContact.prefixPhone = finded.prefixPhone;
    }
  }

  onCloseModal() {

    this.modalCtrl.dismiss({ ok: false }, 'cancel');

  }

  onSubmitContact( frm: NgForm ) {
    if (frm.valid) {
      this.ui.onShowLoading('Guardando...');
      if (!this.loadData) {

        this.addSbc = this.contacSvc.onAddContact( this.bodyContact, this.token )
        .pipe( retry() )
        .subscribe( async (res) => {
          if (!res.ok) {
            throw new Error( res.error );
          }

          await this.ui.onHideLoading();
          await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

          // tslint:disable-next-line: no-bitwise
          if (res.showError & 4) {
            this.pkContactDisposal = res.data.pkContac || 0;
            await this.onConfirmRestore();
            return true;
          }

          if (res.showError === 0) {
            this.bodyContact.pkContact = res.data.pkContac;
            this.onHideModal();
          }


        });

      } else {

        this.updateSbc = this.contacSvc.onUpdateContact( this.bodyContact, this.token )
        .pipe( retry() )
        .subscribe( async (res) => {
          if (!res.ok) {
            throw new Error( res.error );
          }

          await this.ui.onHideLoading();
          await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

          // tslint:disable-next-line: no-bitwise
          if (res.showError & 4) {
            this.pkContactDisposal = res.data.pkContac || 0;
            await this.onConfirmRestore();
            return true;
          }

          if (res.showError === 0) {
            this.onHideModal();
          }

        });

      }

    }
  }

  onHideModal() {
    this.modalCtrl.dismiss({ ok: true, contact: this.bodyContact }, this.loadData ? 'updated' : 'add'  );
  }

  async onConfirmRestore() {
    const confirm = await this.alertCtrl.create({
      header: 'Mensaje al usuario',
      message: 'Ya existe un contacto con el email o teléfono especificado, ¿deseas <b>restaurarlo</b>?',
      buttons: [{
        text: 'Cerrar',
        cssClass: 'text-dark',
        role: 'cancel',
        handler: () => {}
      }, {
        text: 'Restaurar',
        cssClass: 'text-primary',
        role: 'ok',
        handler: async () => {
          console.log('eliminando ');
          await this.ui.onShowLoading('Restaurando...');
          this.onSubmitDel( this.pkContactDisposal , true );
        }
      }]
    });

    await confirm.present();
  }

  onSubmitDel( pkContact: number, status: boolean ) {
    this.delSbc = this.contacSvc.onDelContact( pkContact, status, this.token )
    .pipe( retry() )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onHideLoading();
      if (res.showError === 0) {
        await this.ui.onShowToast('Contacto restaurado con éxito', 4000);

        const contact: IContact = {
          pkContact: res.data.pkContact,
          name: res.data.name,
          surname: res.data.surname,
          nameComplete: res.data.nameComplete,
          email: res.data.email,
          phone: res.data.phone,
          fkNationality: res.data.fkNationality,
          prefixPhone: res.data.prefixPhone,
        };
        this.modalCtrl.dismiss({ ok: true, contact }, 'add' );

      } else {
        await this.ui.onShowToast('Error, no se encontró registro', 4000);
      }

    });
  }

  onGetError( showError: number ) {
    const action = this.loadData ? 'actualizado' : 'creado';
    let arrErr = showError === 0 ? [`Contacto ${ action } con éxito`] : ['Error', 'ya existe un contacto'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 1) {
      arrErr.push('con este email');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 2) {
      arrErr.push('con este teléfono');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 4) {
      arrErr.push('se encuentra inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr = ['Error', 'no se encontró registro']
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErr = ['Error', 'Solo puede registrar un máximo de 3 contactos']
    }

    return arrErr.join(', ');

  }

  ngOnDestroy() {
    if (this.addSbc) {
      this.addSbc.unsubscribe();
    }

    if (this.updateSbc) {
      this.updateSbc.unsubscribe();
    }

    if (this.delSbc) {
      this.delSbc.unsubscribe();
    }
  }

}
