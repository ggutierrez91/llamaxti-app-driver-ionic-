export class OfferModel {
    pkService: number;
    pkOffer: number;
    rateOffer: number;
    isClient: boolean;
    fkDriver: number;
    fkVehicle: number;
    fkJournal: number;
    codeJournal: string;

    constructor() {

        this.pkService = 0;
        this.pkOffer = 0;
        this.rateOffer = 0;
        this.isClient = false;
        this.fkDriver = 0;
        this.fkVehicle = 0;
        this.fkJournal = 0;
        this.codeJournal = '';

    }
}
