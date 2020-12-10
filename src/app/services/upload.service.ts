import { Injectable } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject  } from '@ionic-native/file-transfer/ngx';
import { environment } from '../../environments/environment';
import { EEntity, ETypeFile } from '../models/user-driver-files.model';
import { File } from '@ionic-native/file/ngx';

const putoFile = File;

const URI_API = environment.URL_SERVER;
@Injectable({
  providedIn: 'root'
})
export class UploadService {

  // tslint:disable-next-line: deprecation
  constructor( private fTransfer: FileTransfer, private file: File ) { }

  onUploadImg(imgPath: string, idEntity: number, token: string) {
    const optUpload: FileUploadOptions = {
      fileKey: 'file',
      httpMethod: 'put',
      headers: {
        Authorization: token
      }
    };

    const httpTransfer = this.fTransfer.create();
    return httpTransfer.upload( imgPath, `${ URI_API }/upload/user/${ idEntity }`, optUpload );

  }

  onUploadDocuments( imgPath: string, entity: EEntity, idEntity: number, document: ETypeFile, token: string, isPf: boolean ) {

    const optUpload: FileUploadOptions = {
      fileKey: 'file',
      httpMethod: 'put',
      headers: {
        Authorization: token
      }
    };

    if (isPf) {
      optUpload.fileName = 'doc.pdf';
      optUpload.mimeType = 'application/pdf';
    }

    const httpTransfer = this.fTransfer.create();
    return httpTransfer.upload( imgPath, `${ URI_API }/upload/driver/${ entity }/${ idEntity }/${ document }`, optUpload );

  }

  onDowlandVoucher( fileVoucher: string, token: string ) {

    const dowlandUrl = `${ URI_API }/Dowland/voucher/${ fileVoucher }`;

    this.file.createDir(this.file.externalRootDirectory, 'my_downloads', false)
    .then(   (response) => {
        console.log('Directory created',response);

        const optUpload: FileUploadOptions = {
          // fileKey: 'file',
          httpMethod: 'post',
          headers: {
            Authorization: token
          }
        };
    
        const fileTransfer: FileTransferObject = this.fTransfer.create();

        fileTransfer.download( dowlandUrl , this.file.externalRootDirectory + '/my_downloads/' + fileVoucher, false, optUpload)
        .then((entry) => {
          console.log('file download response',entry);
        })
        .catch((err) =>{
          console.log('error in file download',err);
        });


      
    }).catch( e => console.error('Error al crear directorio') );
  }

}
