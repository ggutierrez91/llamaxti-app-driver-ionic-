import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { StorageService } from './storage.service';
import { IUerSocket } from '../interfaces/user-socket.interface';
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

  constructor(private socket: Socket, private st: StorageService) { }

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
    await this.st.onLoadToken();
    const pkCategory = await this.st.onGetItem('fkCategory', false);
    const codeCategory =  await this.st.onGetItem('codeCategory', false);

    this.usersocket.pkUser = this.st.dataUser.pkUser;
    this.usersocket.userName = this.st.dataUser.userName;
    this.usersocket.nameComplete = this.st.dataUser.nameComplete;
    this.usersocket.role = this.st.dataUser.role;
    this.usersocket.osID = this.st.osID;
    this.usersocket.pkCategory = pkCategory || 0;
    this.usersocket.codeCategory = codeCategory || 'no especificado';
  }

  onSingUser(): Promise<IResSocket> {
    return new Promise( async ( resolve, reject ) => {
      await this.onLoadUser();
      // console.log('enviando socket user', this.usersocket);
      if( this.st.token !== '' ) {
        this.onEmit('sing-user', this.usersocket, (resSocket: IResSocket) => {
          console.log('autenticando usuario socket !!', resSocket);
          if (!resSocket.ok) {
            reject( {ok: false, error: resSocket.error} );
          }
          resolve( {ok: true, message: resSocket.message} );
        });
      } else {
        reject( {ok: false, error: {message: 'Primero authenticar'} } );
      }
    });
  }


}
