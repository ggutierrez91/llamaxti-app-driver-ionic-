export class ServiceModel {
    pkService: number;
    fkJournal: number;
    fkRate: number;
    fkCategory: number;

    coordsOrigin: ICoords;
    coordsDestination: ICoords;
    streetOrigin: string;
    streetDestination: string;

    codeJournal: string;
    distance: number;
    distanceText: string;
    minutes: number;
    minutesText: string;
    rateHistory: number;
    rateService: number;
    // rateOffer: number;
    minRatePrc: number;
    paymentType: string;

    constructor() {
        this.pkService = 0;
        this.fkCategory = 1;
        this.coordsOrigin = { lat: -12.054825, lng: -77.040627 };
        this.coordsDestination = { lat: 0, lng: 0 };
        this.fkJournal = 0;
        this.codeJournal = 'DIURN';
        this.streetOrigin = '';
        this.streetDestination = '';
        this.distance = 0;
        this.distanceText = '';
        this.minutes = 0;
        this.minutesText = '';
        this.fkRate = 0;
        this.rateHistory = 0;
        this.rateService = 0;
        // this.rateOffer = 0;
        this.minRatePrc = 0;
        this.paymentType = 'CASH';
    }

    onReset() {
        this.pkService = 0;
        this.coordsDestination = { lat: 0, lng: 0 };
        this.fkJournal = 0;
        this.codeJournal = 'DIURN';
        this.streetOrigin = '';
        this.streetDestination = '';
        this.distance = 0;
        this.distanceText = '';
        this.minutes = 0;
        this.minutesText = '';
        this.fkRate = 0;
        this.rateHistory = 0;
        this.rateService = 0;
        // this.rateOffer = 0;
        this.minRatePrc = 0;
        this.paymentType = 'CASH';
    }
}

export interface ICoords {
    lat: number;
    lng: number;
}
