import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { File } from '@ionic-native/file/ngx';
import { environment } from 'src/environments/environment';
import { EEntity, ETypeFile } from '../models/user-driver-files.model';

const URI_API = environment.URL_SERVER;

@Injectable({
  providedIn: 'root'
})
export class Upload21Service {

  
  constructor( private http: HttpClient, private file: File ) { }

  uploadImage(file: any, pkEntity: number, token = ''): Promise<any> {

    return new Promise( (resolve, reject) => {

      const reader = new FileReader();
  
      console.log("reading file", file);
  
      reader.onloadend = () => {
  
        const formData = new FormData();
        const imgBlob = new Blob([reader.result], {type: file.type});
        formData.append('file', imgBlob, file.name);
        
        this.http.put( URI_API + `/upload/user/${ pkEntity }` , formData, { headers: {Authorization: token} })
        .subscribe(response => {
    
          resolve(response);
    
        }, err => {
    
          console.log(err);
          reject(err);
    
        });

      };

      reader.readAsArrayBuffer(file);
  
    });

  }

  uploadDocument(file: any, entity: EEntity, pkEntity: number, document: ETypeFile , token = ''): Promise<any> {

    return new Promise( (resolve, reject) => {

      const reader = new FileReader();
  
      // console.log("reading file", file);
  
      reader.onloadend = () => {
  
        const formData = new FormData();
        const imgBlob = new Blob([reader.result], {type: file.type});
        formData.append('file', imgBlob, file.name);
        
        this.http.put( URI_API + `/upload/driver/${ entity }/${ pkEntity }/${ document }` , formData, { headers: {Authorization: token} })
        .subscribe(response => {
    
          resolve(response);
    
        }, err => {
    
          console.log(err);
          reject(err);
    
        });

      };

      reader.readAsArrayBuffer(file);
  
    });

  }

}
