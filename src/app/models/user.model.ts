import { PersonModel } from './person.model';
export class UserModel extends PersonModel {
    pkUser?: number;
    google?: boolean;
    userName: string;
    userPassword: string;
    userPassRepit: string;

    constructor() {
        super();
        this.pkUser = 0;
        this.fkTypeDocument = 1;
        this.fkNationality = 170;
        this.name = '';
        this.surname = '';
        this.document = '';
        this.email = '';
        this.phone = '';
        this.sex = '';
        this.img = '';
        this.google = false;

        this.userName = '';
        this.userPassword = '';
        this.userPassRepit = '';
    }
}
