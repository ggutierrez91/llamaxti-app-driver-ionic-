export class OfferModel {
    pkService: number;
    pkOffer: number;
    rateOffer: number;
    isClient: boolean;
    fkDriver: number;

    constructor() {

        this.pkService = 0;
        this.pkOffer = 0;
        this.rateOffer = 0;
        this.isClient = false;
        this.fkDriver = 0;

    }
}
