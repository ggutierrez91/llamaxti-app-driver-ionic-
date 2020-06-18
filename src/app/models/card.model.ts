export class CardModel {
    pkCard: number;
    fkPerson: number;
    idCardCulqui: string;
    idClientCulqui: string;
    cardNumber: string;
    lastFour: string;
    bank: string;
    countryBank: string;
    countryCodeBank: string;
    brandCard: string;
    typeCard: string;

    constructor() {
        this.pkCard = 0;
        this.fkPerson = 0;
        this.idCardCulqui = '';
        this.idClientCulqui = '';
        this.cardNumber = '';
        this.lastFour = '';
        this.bank = '';
        this.countryBank = '';
        this.countryCodeBank = '';
        this.brandCard = '';
        this.typeCard = '';
    }

    onReset() {
        this.idCardCulqui = '';
        this.idClientCulqui = '';
        this.cardNumber = '';
        this.lastFour = '';
        this.bank = '';
        this.countryBank = '';
        this.countryCodeBank = '';
        this.brandCard = '';
        this.typeCard = '';
    }
}
