import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { IChat } from '../interfaces/chat.interface';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ChatFireService {

  private chatCollection: AngularFirestoreCollection<IChat>;
  public chats: IChat[] = [];

  constructor( private afs: AngularFirestore ) { }

  onLoadChat( fkService: number ) {
    this.chatCollection = this.afs.collection<IChat>('chats' ,
    qfn => qfn.where( 'fkService', '==', fkService )
              .orderBy( 'createdFire', 'desc' )
              .limit(15));
    return this.chatCollection.valueChanges()
                              .pipe( map( (chats)  => {

                                this.chats = [];
                                console.log(chats);
                                for (const message of chats) {
                                  this.chats.unshift( message );
                                }

                              }));
  }

  onAddSend( fkService: number, fkUser: number, msg: string, nameComplete: string ) {

    const newChat: IChat = {
      fkService,
      fkUser,
      nameComplete,
      messsage: msg,
      created: moment().format('LLL'),
      createdFire: new Date()
    };

    return this.chatCollection.add( newChat );

  }

}
