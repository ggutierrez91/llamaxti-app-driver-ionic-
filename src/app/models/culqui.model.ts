export class TokenCulquiModel {
    // tslint:disable-next-line: variable-name
    card_number: string;
    cvv: string;
    // tslint:disable-next-line: variable-name
    expiration_month: string;
    // tslint:disable-next-line: variable-name
    expiration_year: string;
    email: string;
    cardAll: string;
    expiration: string;

    constructor() {
        this.card_number = '';
        this.cardAll = '';
        this.cvv = '';
        this.expiration_month = '';
        this.expiration_year = '';
        this.expiration = '';
        this.email = '';
    }
}


export class ClientCulquiModel {

    // tslint:disable-next-line: variable-name
    first_name = '';
    // tslint:disable-next-line: variable-name
    last_name = '';
    email = '';
    address = '';
    // tslint:disable-next-line: variable-name
    address_city = '';
    // tslint:disable-next-line: variable-name
    country_code = '';
    // tslint:disable-next-line: variable-name
    phone_number = '';

    constructor() {
        this.first_name = '';
        this.last_name = '';
        this.email = '';
        this.address = '';
        this.address_city = '';
        this.country_code = '';
        this.phone_number = '';
    }
}

export class CardCulquiModel {
    // tslint:disable-next-line: variable-name
    customer_id: string;
    // tslint:disable-next-line: variable-name
    token_id: string;

    constructor() {
        this.customer_id = '';
        this.token_id = '';
    }
}
