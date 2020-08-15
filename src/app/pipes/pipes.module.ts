import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgSanitizerPipe } from './img-sanitizer.pipe';
import { ImgDriverPipe } from './img-driver.pipe';
import { ColorPipe } from './color.pipe';
import { YesnoPipe } from './yesno.pipe';
import { PaymentPipe } from './payment.pipe';

@NgModule({
  declarations: [
    ImgSanitizerPipe,
    ImgDriverPipe,
    ColorPipe,
    YesnoPipe,
    PaymentPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ImgSanitizerPipe,
    ImgDriverPipe,
    ColorPipe,
    YesnoPipe,
    PaymentPipe
  ]
})
export class PipesModule { }
