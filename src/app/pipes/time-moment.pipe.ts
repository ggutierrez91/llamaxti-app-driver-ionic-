import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'timeMoment'
})
export class TimeMomentPipe implements PipeTransform {

  transform(value: string, valueTwo = '', diference = false): unknown {
    
    if (diference) {
      const end = moment( value );
      const start = moment( valueTwo );
      return start.diff( end, 'minutes' );
    }

    return moment( value ).locale( 'es' ).format('hh:mm a');
  }

}
