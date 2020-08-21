import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'network'})
export class NetworkPipe implements PipeTransform {
    transform(status: boolean): any {
        return status ? 'Online' : 'Offline';
    }
}
