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
    nameComplete: '',
    role: '',
    osID: '',
    device: 'MOVILE',
    pkCategory: 0,
    codeCategory: 'no especificado'
  };

  public statusSocket = false;

  constructor(private socket: Socket, private st: StorageService, private push: PushService) { }

  onListenStatus() {
    console.log('observando estado servidor!!');
    this.socket.on('connect', () => {
      console.log('Online!!!');

      // if (!this.statusSocket) {
      this.onSingUser().then( res => {
        console.log(res);
      }).catch(e => {
        console.error(e);
      });
      // }
      this.statusSocket = true;
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
    const pkCategory = await this.st.onGetItem('fkCategory', false);
    const codeCategory =  await this.st.onGetItem('codeCategory', false);
    // if (!data) {
    //   return;
    // }
    this.usersocket.pkUser = data.pkUser || 0;
    this.usersocket.userName = data.userName || '';
    this.usersocket.nameComplete = data.nameComplete || '';
    this.usersocket.role = data.role || '';
    this.usersocket.osID = this.push.osID || '';
    this.usersocket.pkCategory = pkCategory || 0;
    this.usersocket.codeCategory = codeCategory || 'no especificado';
  }

  onSingUser(): Promise<IResSocket> {
    return new Promise( async ( resolve, reject ) => {
      await this.onLoadUser();
      // console.log('enviando socket user', this.usersocket);
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
