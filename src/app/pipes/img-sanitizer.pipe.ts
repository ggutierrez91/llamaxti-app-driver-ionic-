import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'imgSanitizer'
})
export class ImgSanitizerPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer ) {}

  transform(srcImg: any): any {

    if (srcImg === '') {
      srcImg = './assets/img/default-photo-2.png';
    }
    return this.sanitizer.bypassSecurityTrustUrl( srcImg );
  }

}
