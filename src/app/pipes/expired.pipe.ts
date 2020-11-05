import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'expired'
})
export class ExpiredPipe implements PipeTransform {

  transform(value: string): unknown {

    let dateExp = moment( value ).locale('es').format('ddd DD MMM hh:mma');
    dateExp = dateExp.replace('.', '');
    dateExp = dateExp.replace('.', '');
    return dateExp;
  }

}
