import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusService'
})
export class StatusServicePipe implements PipeTransform {

  transform(value: number): unknown {
    return value === 3 ? 'Finalizado' : 'Cancelado';
  }

}
