import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'imgSanitizer'
})
export class ImgSanitizerPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer ) {}

  transform(srcImg: string): any {

    if (srcImg === '') {
      srcImg = './assets/img/profile.png';
    }
    return this.sanitizer.bypassSecurityTrustUrl( srcImg );
  }

}
