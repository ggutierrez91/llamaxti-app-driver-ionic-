import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'payment'})
export class PaymentPipe implements PipeTransform {
    transform(code: string): any {
        let str = 'Efectivo';
        switch (code) {
            case 'CASH':
                str = 'Efectivo';
                break;
                case 'CARD':
                    str = 'Tarjeta';
                    break;
                    case 'CRED':
                        str = 'Llamacréditos';
                        break;
            default:
                break;
        }
        return str;
    }
}
