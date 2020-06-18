import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'color'
})
export class ColorPipe implements PipeTransform {

  transform(value: string): string {
    let nameColor = '';

    switch (value) {
      case 'BLUE':
        nameColor = 'AZUL';
        break;
        case 'RED':
        nameColor = 'ROJO';
        break;
        case 'BLACK':
        nameColor = 'NEGRO';
        break;
        case 'WHITE':
        nameColor = 'BLANCO';
        break;
        case 'GRAY':
        nameColor = 'GRIS';
        break;
        case 'YELLOW':
        nameColor = 'AMARILLO';
        break;
        case 'BROWN':
        nameColor = 'MARRON';
        break;
        case 'GREEN':
        nameColor = 'VERDE';
        break;

      default:
        break;
    }
    return nameColor;
  }

}
