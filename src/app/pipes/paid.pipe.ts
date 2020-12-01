import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paid'
})
export class PaidPipe implements PipeTransform {

  transform(value: boolean): unknown {
    return value ? 'Pagado' : 'Debe';
  }

}
