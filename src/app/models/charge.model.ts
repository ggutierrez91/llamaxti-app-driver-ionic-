export class ChargeModel {
    amount: number;
    // tslint:disable-next-line: variable-name
    currency_code: string;
    email: string;
    // tslint:disable-next-line: variable-name
    source_id: string;
    pkJournal: number;
    cardCulqui: string;

    constructor() {
        this.amount = 0;
        this.currency_code = 'PEN';
        this.email = '';
        this.source_id = '';
        this.pkJournal = 0;
        this.cardCulqui = '';
    }
}
