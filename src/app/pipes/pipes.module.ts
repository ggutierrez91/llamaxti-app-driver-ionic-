import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgSanitizerPipe } from './img-sanitizer.pipe';
import { ImgDriverPipe } from './img-driver.pipe';
import { ColorPipe } from './color.pipe';

@NgModule({
  declarations: [
    ImgSanitizerPipe,
    ImgDriverPipe,
    ColorPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ImgSanitizerPipe,
    ImgDriverPipe,
    ColorPipe
  ]
})
export class PipesModule { }
