import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { ModalContactPage } from '../modal-contact/modal-contact.page';
import { ModalController, AlertController } from '@ionic/angular';
import { ContactModel } from '../../models/contact.model';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { IContact } from 'src/app/interfaces/contact.interface';
import { ContactsService } from '../../services/contacts.service';
import { UiUtilitiesService } from '../../services/ui-utilities.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit, OnDestroy {

  sbcNationality: Subscription;
  sbcList: Subscription;
  sbcDel: Subscription;

  bodyContact: ContactModel;
  dataNationality: any[] = [];
  dataContacts: IContact[] = [];

  loading = false;

  // tslint:disable-next-line: max-line-length
  constructor( private st: StorageService, private modalCtrl: ModalController, private authSvc: AuthService, private contacsSvc: ContactsService, private alertCtrl: AlertController, private ui: UiUtilitiesService ) { }

  ngOnInit() {


    this.bodyContact = new ContactModel();

    this.st.onLoadToken().then( () => {
      this.onLoadNationality();
      this.onGetContacts();

    }).catch( e => console.error('Error al cargar storage') );

  }

  onShowModal() {
    this.onBuildModal();
  }

  onGetContacts() {
    this.loading = true;
    this.sbcNationality = this.contacsSvc.onGetContact()
    // .pipe( retry() )
    .subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataContacts = res.data;
      this.loading = false;
    });

  }

  onEdit( item: IContact ) {
    this.bodyContact.pkContact = item.pkContact;
    this.bodyContact.name = item.name;
    this.bodyContact.surname = item.surname;
    this.bodyContact.email = item.email;
    this.bodyContact.phone = item.phone;
    this.bodyContact.fkNationality = item.fkNationality;
    this.bodyContact.prefixPhone = item.prefixPhone;

    this.onBuildModal( true );
  }

  async onConfirmDel( item: IContact ) {
    const confirmDel = await this.alertCtrl.create({
      header: 'Mensaje al usuario',
      message: '¿Está seguro de <b>eliminar</b> este contacto?',
      mode: 'ios',
      animated: true,
      buttons: [{
        text: 'No',
        cssClass: 'text-dark',
        handler: () => {}
      }, {
        text: 'Eliminar',
        cssClass: 'text-danger',
        handler: async () => {
          await this.ui.onShowLoading('Eliminando...');
          this.onDeleteContact( item.pkContact, false );
        }
      }]
    });

    await confirmDel.present();
  }

  onDeleteContact( pk: number, status = false ) {
    this.sbcDel = this.contacsSvc.onDelContact( pk, status )
    // .pipe( retry() )
    .subscribe( async (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onHideLoading();
      await this.ui.onShowToast( this.onGetError( res.showError ), 4500 );
      if (res.showError === 0) {
        this.dataContacts = this.dataContacts.filter( cc => cc.pkContact !== pk );
      }

    });
  }

  onGetError( showError: number ) {
    const arrErr = showError === 0 ? ['Se eliminó con éxito'] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if (showError & 8) {
      arrErr.push('no se encontró contacto');
    }

    // tslint:disable-next-line: no-bitwise
    if (showError & 16) {
      arrErr.push('solo puede tener 3 contactos de emergencia');
    }

    return arrErr.join(', ');

  }

  async onBuildModal( loadData = false ) {
    const contactModal = await this.modalCtrl.create({
      component: ModalContactPage,
      animated: true,
      mode: 'ios',
      componentProps: {
        loadData,
        title: loadData ? 'Editar contacto' : 'Nuevo contacto',
        token: this.st.token,
        bodyContact: this.bodyContact,
        dataNationality: this.dataNationality
      }
    });

    await contactModal.present();

    contactModal.onWillDismiss().then( (modal) => {

      if (modal.data.ok) {

        const contact: any = modal.data.contact;
        if (modal.role === 'add') {

          const newConact: IContact = {
            pkContact: contact.pkContact,
            fkNationality: contact.fkNationality,
            name: contact.name,
            surname: contact.surname,
            nameComplete: `${ contact.surname }, ${ contact.name }`,
            email: contact.email,
            phone: contact.phone,
            prefixPhone: contact.prefixPhone,
          };

          this.dataContacts.unshift( newConact );

        } else if (modal.role === 'updated') {
          const finded = this.dataContacts.find( cc => cc.pkContact === contact.pkContact );
          if (finded) {
            finded.name = contact.name;
            finded.surname = contact.surname;
            finded.nameComplete = `${ contact.surname }, ${ contact.name }`;
            finded.email = contact.email;
            finded.phone = contact.phone;
            finded.prefixPhone = contact.prefixPhone;
          }
        }

        this.bodyContact.onReset();

      } else {
        this.bodyContact.onReset();
      }

    }).catch(e => console.error( 'Error al cerrar modal' ) );

  }

  onLoadNationality() {
    this.sbcNationality = this.authSvc.onGetNationality( '' )
    // .pipe( retry() )
    .subscribe( (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataNationality = res.data;
    });
  }

  ngOnDestroy() {
    if (this.sbcNationality) {
      this.sbcNationality.unsubscribe();
    }
  }

}
