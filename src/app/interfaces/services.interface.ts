export interface IServices {

    pkService: number;
    fkClient: number;
    pkOfferService: number;
    img: string;
    nameComplete: string;
    rateHistory: number;
    streetOrigin: string;
    streetDestination: string;
    distanceText: string;
    minutesText: string;
    rateService: number;
    minRatePercent: number;
    rateOffer: number;
    rateOfferHistory: number;
    created: string;
    changeRate: number;
    aliasCategory: string;
    osId: string;
    isMinRate: boolean;

}

export interface IPolygons {
    center: number[];
    indexHex: string;
    polygon: any[];
    total: number;
    totalDrivers: number;
}
