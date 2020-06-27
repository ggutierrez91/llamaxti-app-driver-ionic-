export interface IOffer {
    pkOfferService: number;
    pkService: number;
    fkDriver: number;
    fkClient: number;
    dateOfferDriver: string;
    streetOrigin: string;
    streetDestination: string;
    distanceText: string;
    minutesText: string;
    rateHistory: number;
    rateService: number;
    nameComplete: string;
    phone: string;
    document: string;
    imgDriver: string;
    img: string; // foto del cliente
    nameDocument: string;
    prefix: string;
    nameCountry: string;
    prefixPhone: string;
    aliasCategory: string;
    codeCategory: string;
    pkCategory: number;
    rateOffer: number;
    rateOfferHistory: number;
    minRatePercent: number;
    isMinRate: number;

    color: string;
    numberPlate: string;
    year: number;
    nameBrand: string;
    nameModel: string;
    changeRate: number;
    osId: string;
}