import { Injectable } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { environment } from '../../environments/environment';
import { EEntity, ETypeFile } from '../models/user-driver-files.model';

const URI_API = environment.URL_SERVER;
@Injectable({
  providedIn: 'root'
})
export class UploadService {

  // tslint:disable-next-line: deprecation
  constructor( private fTransfer: FileTransfer ) { }

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

}
