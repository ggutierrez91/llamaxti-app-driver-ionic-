export class RefundModel {
    amount: number;
    // tslint:disable-next-line: variable-name
    charge_id: string;
    reason: string;

    constructor( amount: number, charge: string, reason: string ) {
        this.amount = amount;
        this.charge_id = charge;
        this.reason = reason;
    }
}
