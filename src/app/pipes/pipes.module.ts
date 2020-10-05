import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgSanitizerPipe } from './img-sanitizer.pipe';
import { ImgDriverPipe } from './img-driver.pipe';
import { ColorPipe } from './color.pipe';
import { YesnoPipe } from './yesno.pipe';
import { PaymentPipe } from './payment.pipe';
import { NetworkPipe } from './network.pipe';
import { MomentPipe } from './moment.pipe';
import { StatusServicePipe } from './status-service.pipe';
import { TimeMomentPipe } from './time-moment.pipe';

@NgModule({
  declarations: [
    ImgSanitizerPipe,
    ImgDriverPipe,
    ColorPipe,
    YesnoPipe,
    PaymentPipe,
    NetworkPipe,
    MomentPipe,
    StatusServicePipe,
    TimeMomentPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ImgSanitizerPipe,
    ImgDriverPipe,
    ColorPipe,
    YesnoPipe,
    PaymentPipe,
    NetworkPipe,
    MomentPipe,
    StatusServicePipe,
    TimeMomentPipe
  ]
})
export class PipesModule { }
