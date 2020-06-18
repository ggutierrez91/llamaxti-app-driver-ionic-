import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { StorageService } from './storage.service';
import { IUerSocket } from '../interfaces/user-socket.interface';
import { PushService } from './push.service';
import { IResSocket } from '../interfaces/response-socket.interface';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private usersocket: IUerSocket = {
    pkUser: 0,
    userName: '',
    role: '',
    osID: '',
    device: 'MOVILE'
  };

  public statusSocket = false;

  constructor(private socket: Socket, private st: StorageService, private push: PushService) { }

  onListenStatus() {
    console.log('observando estado servidor!!');
    this.socket.on('connect', () => {
      this.statusSocket = true;
      console.log('Online!!!');

      if (this.st.token !== '') {
        this.onSingUser().then( res => {
          console.log(res.message);
        }).catch(e => {
          console.error(e);
        });
      }
    });

    this.socket.on('disconnect', () => {
      this.statusSocket = false;
      console.log('Offline!!!');
    });
  }

  // tslint:disable-next-line: ban-types
  onEmit( event: string, payload: any, callback: Function ) {
    return this.socket.emit( event, payload, callback );
  }

  onListen( event: string ) {
    return this.socket.fromEvent( event );
  }

  async onLoadUser() {
    const data = await this.st.onGetItem('dataUser', true);
    if (!data) {
      return;
    }
    this.usersocket.pkUser = data.pkUser || 0;
    this.usersocket.userName = data.userName || '';
    this.usersocket.role = data.role || '';
    this.usersocket.osID = this.push.osID || '';
  }

  onSingUser(): Promise<IResSocket> {
    return new Promise( async(resolve, reject) => {
      await this.onLoadUser();
      this.onEmit('sing-user', this.usersocket, (resSocket: IResSocket) => {
        console.log('autenticando usuario socket !!', resSocket);
        if (!resSocket.ok) {
          reject( {ok: false, error: resSocket.error} );
        }
        resolve( {ok: true, message: resSocket.message} );
      });
    });
  }


}
