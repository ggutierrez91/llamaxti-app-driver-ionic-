export class ContactModel {

    pkContact: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    fkNationality: number;
    prefixPhone: string;

    constructor() {
        this.pkContact = 0;
        this.name = '';
        this.surname = '';
        this.email = '';
        this.phone = '';
        this.fkNationality = 170;
        this.prefixPhone = '+51';
    }

    onReset() {
        this.pkContact = 0;
        this.name = '';
        this.surname = '';
        this.email = '';
        this.phone = '';
        this.fkNationality = 170;
        this.prefixPhone = '+51';
    }
}
