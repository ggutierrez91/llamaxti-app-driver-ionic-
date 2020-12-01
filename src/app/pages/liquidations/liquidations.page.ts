import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { LiquidationsService } from '../../services/liquidations.service';

@Component({
  selector: 'app-liquidations',
  templateUrl: './liquidations.page.html',
  styleUrls: ['./liquidations.page.scss'],
})
export class LiquidationsPage implements OnInit, OnDestroy {

  constructor( private st: StorageService, private ui: UiUtilitiesService, private liquiSvc: LiquidationsService ) { }

  ngOnInit() {

    this.st.onLoadToken(  ).then( () => {

    }).catch( e => console.error('Error al cargar storage') );

  }

  ngOnDestroy(): void {

    
  }

}
