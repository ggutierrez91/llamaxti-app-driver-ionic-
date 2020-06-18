import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'imgDriver'
})
export class ImgDriverPipe implements PipeTransform {

  constructor(private domSan: DomSanitizer) {}

  transform(imgSrc: string, typeFile: string): any {

    // LICENSE
    // PHOTO_CHECK
    // CRIMINAL_RECORD
    // POLICIAL_RECORD
    // LEASE
    // SOAT
    // PROPERTY_CARD

    let imgEmpty = '';

    let arrImg = imgSrc.split('.');
    arrImg = arrImg[ arrImg.length - 1 ].split('?');
    const extension = arrImg[ 0 ].toLowerCase();

    switch ( typeFile.toUpperCase()  ) {
      case 'LICENSE':
        imgEmpty = './assets/img/licencia.png';
        break;
      case 'PHOTO_CHECK':
        imgEmpty = './assets/img/fotochet.png';
        break;
      case 'CRIMINAL_RECORD':
        if (extension === 'pdf') {
          imgSrc = './assets/img/001-accepted.png';
        }
        imgEmpty = './assets/img/criminalRecord.png';
        break;
      case 'POLICIAL_RECORD':
        if (extension === 'pdf') {
          imgSrc = './assets/img/001-accepted.png';
        }
        imgEmpty = './assets/img/policial_record.jpg';
        break;
      case 'LEASE':
        imgEmpty = './assets/img/license.png';
        break;
      case 'SOAT':
        imgEmpty = './assets/img/soat.png';
        break;
      case 'PROPERTY_CARD':
        imgEmpty = './assets/img/propertyCard.jpg';
        break;
      case 'DNI':
        imgEmpty = './assets/img/dni.png';
        break;

      case 'TAXI_FRONTAL':
        imgEmpty = './assets/img/taxi_frontal.jpg';
        break;
      case 'TAXI_BACK':
        imgEmpty = './assets/img/taxi_back.jpg';
        break;

      case 'TAXI_INTERIOR':
        imgEmpty = './assets/img/taxi_interior.jpg';
        break;
      default:
        imgEmpty = './assets/img/license.png';
        break;
    }

    return this.domSan.bypassSecurityTrustUrl( imgSrc === '' ? imgEmpty : imgSrc );
  }

}
