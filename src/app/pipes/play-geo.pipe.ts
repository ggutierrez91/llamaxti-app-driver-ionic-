import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'playGeo'
})
export class PlayGeoPipe implements PipeTransform {

  transform(value: boolean): unknown {
    return value ? 'Encendido' : 'Apagado';
  }

}
