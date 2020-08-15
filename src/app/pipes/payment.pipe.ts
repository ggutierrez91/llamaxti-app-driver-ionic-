import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'payment'})
export class PaymentPipe implements PipeTransform {
    transform(code: string): any {
        return code === 'CASH' ? 'Efectivo' : 'Tarjeta';
    }
}
