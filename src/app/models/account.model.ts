export class AccountModel {

    pkAccountDriver: number;
    ccAccount: string;
    cciAccount: string;
    fkBank: number;
    bankName: string;
    bankAlias: string;
    dateRegister: string;

    constructor() {
        this.pkAccountDriver = 0;
        this.ccAccount = '';
        this.cciAccount = '';
        // this.fkBank = 0;
        this.bankName = '';
        this.bankAlias = '';
        this.dateRegister = '';
    }

    onReset() {
        this.pkAccountDriver = 0;
        this.ccAccount = '';
        this.cciAccount = '';
        // this.fkBank = 0;
        this.bankName = '';
        this.bankAlias = '';
        this.dateRegister = '';
    }

}
