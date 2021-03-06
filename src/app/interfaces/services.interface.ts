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
    coordsDestination?: ICoords;
    latOrigin?: number;
    lngOrigin?: number;
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
    imgTaxiFrontal?: string;
    pkDriver?: number;

    // datos del cupon de descuento
    fkCouponUser?: number;
    discount?: number;
    discountType?: string;
    monitorToken?: string;

    // datos del pago
    cardCulqui?: string;
    cardTkn?: string;
    chargeCulqui?: string;

}

export interface IServiceSocket {
    data: IServices;
    polygon: number[][];
    center: number[];
    indexHex: string;
    totalDrivers: number;
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
    nameClient: string;
    imgClient?: string;
    phoneClient?: string;
    emailClient?: string;
    documentClient?: string;
    typeDocClient?: string;
    osIdClient?: string;
    nameDriver: string;
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
    streetOrigin?: string;
    streetDestination?: string;
    distanceText?: string;
    minutesText?: string;
    rateOffer?: number;

    latDriver?: number;
    lngDriver?: number;

    numberPlate?: string;
    year?: number;
    color?: string;
    aliasCategory?: string;
    imgTaxiFrontal: string;
    fkVehicle: number;
    pkDriver: number;
    fkClient: number;
    nameModel: string;
    nameBrand: string;
    paymentType: string;

    runOrigin?: boolean;
    finishOrigin?: boolean;
    runDestination?: boolean;
    finishDestination?: boolean;
    dateRunOrigin?: string;
    dateFinishOrigin?: string;
    dateRunDestination?: string;
    dateFinishDestination?: string;

    monitorToken?: string;
    fkOffer?: number;
}
