export interface IServiceHistory {
    pkService: number;
    nameClient: string;
    imgClient: string;
    aliasCategory: string;
    distanceText: string;
    minutesText: string;
    streetOrigin: string;
    streetDestination: string;
    dateRegister: string;
    statusService: number;
    calificatedDriver: boolean;
    paymentType: string;
    rateService: number;
    calification: number;
}

export interface IDetailService {
    latOrigin: number;
    lngOrigin: number;
    latDestination: number;
    lngDestination: number;
    streetOrigin: string;
    streetDestination: string;
    distanceText: string;
    minutesText: string;
    paymentType: string;

    numberPlate: string;
    year: number;
    color: string;

    imgTaxiFrontal: string;
    fkVehicle: string;
    nameModel: string;
    nameBrand: string;

    dateRunOrigin: string;
    dateFinishOrigin: string;
    dateRunDestination: string;
    dateFinishDestination: string;
}
