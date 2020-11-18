import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { RestoreModel } from 'src/app/models/restore.model';
import { RestoreService } from 'src/app/services/restore.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';

@Component({
  selector: 'app-restore-account',
  templateUrl: './restore-account.page.html',
  styleUrls: ['./restore-account.page.scss'],
})
export class RestoreAccountPage implements OnInit, OnDestroy {

  @ViewChild( IonSlides, {static: true} ) slide: IonSlides;

  restoreSbc: Subscription;

  bodyRestore: RestoreModel = {
    email: ''
  };
  loading = false;

  constructor( private restSvc: RestoreService, private ui: UiUtilitiesService ) { }

  ngOnInit() {
    this.slide.lockSwipes( true );
  }

  onSendEmail() {
    this.loading = true;
    this.restoreSbc = this.restSvc.onSendEmail( this.bodyRestore )
    .pipe( retry(3) )
    .subscribe( (res) => {
      if (!res.ok) {
        throw Error( res.error );
      }
      this.loading = false;
      this.ui.onShowToast( this.onGetError( res.showError ), 4500 );

    });
  }

  onGetError( showError: number ) {
    const arrError = showError === 0 ? ['Mensaje enviado con éxito, el link caducará en 60 minutos revise su email'] : ['Alerta'];

    // tslint:disable-next-line: no-bitwise
    if ( showError & 1 ) {
      arrError.push('No se encontró usuario asociado con este email');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 2 ) {
      arrError.push('Solo clientes y conductores');
    }

    return arrError.join(', ');
  }

  ngOnDestroy() {
    if (this.restoreSbc) {
      this.restoreSbc.unsubscribe();
    }
  }

}
