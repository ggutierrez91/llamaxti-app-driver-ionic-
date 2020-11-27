
export class CardModel {

    // tslint:disable-next-line: variable-name
    card_number: string;
    cvv: string;
    // tslint:disable-next-line: variable-name
    expiration_month: string;
    // tslint:disable-next-line: variable-name
    expiration_year: string;
    email: string;
    // cardAll: string;
    expiration: string;

    constructor() {
        this.card_number = '';
        this.cvv = '';
        this.expiration_month = '';
        this.expiration_year = '';
        this.email = '';
        this.expiration = '';
    }

    onReset() {
        this.card_number = '';
        this.cvv = '';
        this.expiration_month = '';
        this.expiration_year = '';
        this.email = '';
        this.expiration = '';
    }
}
