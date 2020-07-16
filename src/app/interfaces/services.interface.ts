export interface IServices {

    pkService?: number;
    fkClient?: number;
    fkDriver?: number;
    pkOfferService?: number;
    img?: string;
    nameComplete?: string;
    prefix?: string;
    document?: string;
    phone?: string;
    nameCountry?: string;
    rateHistory?: number;
    latOrigin?: number;
	lngOrigin?: number;
    streetOrigin?: string;
    streetDestination?: string;
    distanceText?: string;
    minutesText?: string;
    rateService?: number;
    minRatePercent?: number;
    rateOffer?: number;
    rateOfferHistory?: number;
    created?: string;
    changeRate?: number;
    osId?: string;
    isMinRate?: boolean;

    pkCategory?: number;
    aliasCategory?: string;
    codeCategory?: string;
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
    streetOrigin?: string;
    streetDestination?: string;
    distanceText?: string;
    minutesText?: string;
    rateOffer?: number;

    numberPlate?: string;
    year?: number;
    color?: string;
    aliasCategory?: string;

}
