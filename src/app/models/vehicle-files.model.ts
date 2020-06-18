import { IResPromise } from '../interfaces/response-prom.interfaces';

export enum ETypeFile {

    soat = 'SOAT',
    propertyCard = 'PROPERTY_CARD',
    taxiFrontal = 'TAXI_FRONTAL',
    taxiBack = 'TAXI_BACK',
    taxiInterior = 'TAXI_INTERIOR',
}

class FileModel {

    typeFile: ETypeFile;
    pathFile: string;
    srcFile: string;
    required: boolean;
    changed: boolean;

    constructor( typeFile: ETypeFile, required: boolean) {

        this.typeFile = typeFile;
        this.pathFile = '';
        this.srcFile = '';
        this.required = required;
        this.changed = false;
    }
}

export class VehicleFilesModel {

    filesVehicle: FileModel[];

    constructor() {
        this.filesVehicle = [];
    }

    onAddFile( typeFile: ETypeFile, required: boolean ): IResPromise {


        const indexFind = this.filesVehicle.findIndex( item => item.typeFile === typeFile );

        if ( indexFind !== -1 ) {
            return {
                ok: false,
                error: { message: 'Ya existe un archivo para ' + typeFile }
            };
        }

        this.filesVehicle.push( new FileModel( typeFile, required ) );

        return { ok: true };
    }

    onUpdateFile( typeFile: ETypeFile, path: string, src: string ): IResPromise {

        const indexFind = this.filesVehicle.findIndex( item => item.typeFile === typeFile );

        // console.log('indexFind', indexFind);
        if ( indexFind === -1 ) {
            return {
                ok: false,
                error: { message: 'Archivo no encontrado: code 404 ' }
            };
        }

        this.filesVehicle[indexFind].pathFile = path;
        this.filesVehicle[indexFind].srcFile = src;
        return { ok: true };

    }

    onGetSrc( typeFile: string ) {
        const item = this.filesVehicle.find( file => file.typeFile === typeFile );
        return item.srcFile || '';
    }

}
