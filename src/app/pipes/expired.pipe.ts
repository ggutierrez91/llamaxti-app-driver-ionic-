import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'expired'
})
export class ExpiredPipe implements PipeTransform {

  transform(value: string, withHour = true ): unknown {

    const format = withHour ? 'ddd DD MMM hh:mma' : 'ddd DD MMM';

    let dateExp = moment( value ).locale('es').format(format);
    dateExp = dateExp.replace('.', '');
    dateExp = dateExp.replace('.', '');
    return dateExp;
  }

}
