import { IResPromise } from '../interfaces/response-prom.interfaces';

export enum EEntity {
    driver = 'DRIVER',
    vehicle = 'VEHICLE'
}

export enum ETypeFile {
    license = 'LICENSE',
    photoCheck = 'PHOTO_CHECK',
    criminalRecord = 'CRIMINAL_RECORD',
    policialRecord = 'POLICIAL_RECORD',
    lease = 'LEASE',
    soat = 'SOAT',
    propertyCard = 'PROPERTY_CARD',
    dni = 'DNI',
    taxiFrontal = 'TAXI_FRONTAL',
    taxiBack = 'TAXI_BACK',
    taxiInterior = 'TAXI_INTERIOR',
}

class FileModel {
    entity: EEntity; //DRIVER : VEHICLE
    typeFile: ETypeFile;
    pathFile: string;
    srcFile: string;
    required: boolean;
    isPdf: boolean;

    constructor(entity: EEntity, typeFile: ETypeFile, required: boolean) {
        this.entity = entity;
        this.typeFile = typeFile;
        this.pathFile = '';
        this.srcFile = '';
        this.required = required;
        this.isPdf = false;
    }
}

export class DriverFilesModel {

    filesDriver: FileModel[];

    constructor() {
        this.filesDriver = [];
    }

    onAddFile( entity: EEntity, typeFile: ETypeFile, required: boolean ): IResPromise {

        const indexFind = this.filesDriver.findIndex(
            item => item.entity === entity && item.typeFile === typeFile
        );

        if ( indexFind !== -1 ) {
            return {
                ok: false,
                error: { message: 'Ya existe un archivo para ' + entity }
            };
        }

        this.filesDriver.push( new FileModel( entity, typeFile, required ) );

        return { ok: true };
    }

    onUpdateFile(  entity: EEntity, typeFile: ETypeFile, path: string, src: string, isPdf = false ) {

        const indexFind = this.filesDriver.findIndex(
            item => item.entity === entity && item.typeFile === typeFile
        );
        console.log('indexFind', indexFind);
        if ( indexFind === -1 ) {
            return {
                ok: false,
                error: { message: 'Archivo no encontrado: code 404 ' }
            };
        }

        this.filesDriver[indexFind].pathFile = path;
        this.filesDriver[indexFind].srcFile = src;
        this.filesDriver[indexFind].isPdf = isPdf;
        return { ok: true };

    }

    onChangeIsEmployee( isEmployee: boolean ) {
        this.filesDriver.forEach( item => {
            if (item.entity === EEntity.driver) {
                if (isEmployee) { // si es un taxista certificado
                    if (item.typeFile === ETypeFile.photoCheck) {
                        item.required = true;
                    }

                    if (item.typeFile === ETypeFile.criminalRecord) {
                        item.pathFile = '';
                        item.srcFile = '';
                        item.required = false;
                    }

                    if (item.typeFile === ETypeFile.policialRecord) {
                        item.required = false;
                        item.pathFile = '';
                        item.srcFile = '';
                    }
                } else {
                    if (item.typeFile === ETypeFile.photoCheck) {
                        item.required = false;
                        item.pathFile = '';
                        item.srcFile = '';
                    }

                    if (item.typeFile === ETypeFile.criminalRecord) {
                        item.required = true;
                    }

                    if (item.typeFile === ETypeFile.policialRecord) {
                        item.required = true;
                    }
                }
            }
        });
    }

    onGetSrc( typeFile: string ) {
        const item = this.filesDriver.find( file => file.typeFile === typeFile );
        return item.srcFile || '';
    }

    onVerify( entity: EEntity ): boolean {
        let ok = true;
        this.filesDriver.forEach( item => {
            if ( item.entity === entity ) {
                if ( item.required && item.pathFile === '' ) {
                    ok = false;
                }
            }
        });
        
        return ok;
    }

}

