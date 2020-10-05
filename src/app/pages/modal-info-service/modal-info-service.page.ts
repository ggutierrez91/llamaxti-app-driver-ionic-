import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IDetailService, IServiceHistory } from 'src/app/interfaces/history.interface';
import { HistoryService } from 'src/app/services/history.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';
import { retry } from 'rxjs/operators';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-modal-info-service',
  templateUrl: './modal-info-service.page.html',
  styleUrls: ['./modal-info-service.page.scss'],
})
export class ModalInfoServicePage implements OnInit, OnDestroy {

  @ViewChild('mapInfo', {static: true}) mapDriver: ElementRef;

  @Input() dataService: IServiceHistory;
  @Input() token: string;

  detailSbc: Subscription;

  pathImg = URI_SERVER + '/User/Img/Get/';

  map: google.maps.Map;
  codeJournal = 'DIURN';

  directionService: google.maps.DirectionsService;
  directionRender: google.maps.DirectionsRenderer;

  dataServiceInfo: IDetailService;

  constructor( private modalCtrl: ModalController, private st: StorageService, private historySvc: HistoryService ) { }

  ngOnInit() {

    this.onLoadMap();
    
    this.st.onGetItem('codeJournal', false).then( (val: string) => {
      this.onLoadMap();
      this.onGetDetail();
      this.codeJournal = val || 'DIURN';

      const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;

      this.map.setOptions({
        styles: styleMap
      });

    }).catch(e => console.error('Error al cargar code journal') );

  }

  onLoadMap() {
    const styleMap: any = this.codeJournal === 'DIURN' ? environment.styleMapDiur : environment.styleMapNocturn;
    const optMap: google.maps.MapOptions = {
      center: new google.maps.LatLng( -12.054825, -77.040627 ),
      zoom: 4.5,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap
    };

    this.map = new google.maps.Map( this.mapDriver.nativeElement, optMap );

    this.directionService = new google.maps.DirectionsService();
    this.directionRender = new google.maps.DirectionsRenderer({map: this.map});

  }

  onLoadRoute() {
    const latA = this.dataServiceInfo.latOrigin;
    const lngA = this.dataServiceInfo.lngOrigin;
    const pointA = new google.maps.LatLng( latA, lngA );

    const  latB = this.dataServiceInfo.latDestination;
    const  lngB = this.dataServiceInfo.lngDestination;
    const pointB = new google.maps.LatLng( latB, lngB );

    this.directionService.route({ origin: pointA,
                                  destination: pointB,
                                  travelMode: google.maps.TravelMode.DRIVING }, (res, status) => {
        if (status === 'OK') {
          this.directionRender.setDirections(res);
        }
    });
  }

  onGetDetail() {
    this.detailSbc = this.historySvc.onGetDetailHistory( this.dataService.pkService )
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataServiceInfo = res.data;
      this.onLoadRoute();
    });
  }

  onCloseModal() {
    this.modalCtrl.dismiss({ok: false}, 'cancel');
  }

  ngOnDestroy() {

    if (this.detailSbc) {
      this.detailSbc.unsubscribe();
    }

  }

}
