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
    codeCategory: 'no especificado',
    occupied: false,
    playGeo: false
  };

  public statusSocket = false;

  constructor(private socket: Socket, private st: StorageService) { }

  onListenStatus() {
    console.log('observando estado servidor!!');
    this.socket.on('connect', () => {
      // console.log('Online!!!');

      this.statusSocket = true;

      this.onSingUser().then( res => {
        console.log(res);
      }).catch(e => {
        console.error(e);
      });

    });

    this.socket.on('disconnect', () => {
      this.statusSocket = false;
      // console.log('Offline!!!');
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
    await this.st.onLoadVehicle();

    this.usersocket.pkUser = this.st.dataUser.pkUser;
    this.usersocket.userName = this.st.dataUser.userName;
    this.usersocket.nameComplete = this.st.dataUser.nameComplete;
    this.usersocket.role = this.st.dataUser.role;
    this.usersocket.osID = this.st.osID;
    this.usersocket.pkCategory = this.st.fkCategory;
    this.usersocket.codeCategory = this.st.codeCategory;
    this.usersocket.occupied = this.st.occupied;
    this.usersocket.playGeo = this.st.playGeo;
  }

  onSingUser(): Promise<IResSocket> {
    return new Promise( async ( resolve, reject ) => {
      await this.onLoadUser();
      if ( this.st.token !== '' ) {
        this.onEmit('sing-user', this.usersocket, (resSocket: IResSocket) => {
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
