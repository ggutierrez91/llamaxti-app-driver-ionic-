import { ICoords } from '../models/service.model';
export interface IServices {

    pkService?: number;
    fkClient?: number;
    fkDriver?: number;
    fkJournal?: number;
    fkRate?: number;
    fkCategory?: number;
    codeCategory?: string;
    coordsOrigin?: ICoords;
    latOrigin?: number;
    lngOrigin?: number;
    coordsDestination?: ICoords;
    streetOrigin?: string;
    streetDestination?: string;

    codeJournal?: string;
    distance?: number;
    distanceText?: string;
    minutes?: number;
    minutesText?: string;
    rateHistory?: number;
    rateService?: number;
    rateOfferHistory?: number;
    rateOffer?: number;
    minRate?: number;
    minRatePercent?: number;
    isMinRate?: boolean;
    paymentType?: string;
    indexHex?: string;

    // datos de relleno para que el conductor identifique al cliente
    img?: string;
    nameComplete?: string;
    // otros
    dateOfferClient?: any; // fecha de registro cliente
    dateOfferDriver?: any; // fecha de registro conductor
    osId?: string;
    aliasCategory?: string;
    changeRate?: boolean;
    pkOfferService?: number;

    color?: string;
    numberPlate?: string;
    year?: number;
    nameBrand?: string;
    nameModel?: string;
    pkVehicle?: number;

}

export interface IPolygons {
    center: number[];
    indexHex: string;
    polygon: any[];
    total: number;
    totalDrivers: number;
}

export interface IServiceAccepted {

    pkService?: number;
    fkClient?: number;
	fkDriver?: number;
    nameClient: string;
    imgClient?: string;
    phoneClient?: string;
    emailClient?: string;
    documentClient: string;
    typeDocClient?: string;
    osIdClient?: string;
    nameDriver?: string;
    imgDriver?: string;
    phoneDriver?: string;
    emailDriver?: string;
    documentDriver?: string;
    typeDocDriver?: string;
    osIdDriver?: string;

    latOrigin?: number;
    lngOrigin?: number;
    latDestination?: number;
    lngDestination?: number;
    latDriver?: number;
    lngDriver?: number;
    streetOrigin?: string;
    streetDestination?: string;
    distanceText?: string;
    minutesText?: string;
    rateOffer?: number;

    numberPlate?: string;
    year?: number;
    color?: string;
    aliasCategory?: string;

    runDestination?: boolean;
    finishDestination?: boolean;
    dateRunOrigin?: string;
    dateFinishOrigin?: string;
    dateRunDestination?: string;
    dateFinishDestination?: string;

}
