import { PersonModel } from './person.model';
export class DriverModel extends PersonModel {

    pkUser?: number;
    google?: boolean;
    userName: string;
    userPassword: string;
    userPassRepit: string;
    verifyReniec: boolean;
    // DATOS DEL CONDUCTOR
    dateLicenseExpiration: string;
    categoryLicense: string;
    isEmployee: boolean;

    // DATOS DEL VEHICULO
    isProper: boolean;
    numberPlate: string;
    year: number;
    color: string;
    dateSoatExpiration: string;
    codeReferal: string;
    conditions: boolean;

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
        this.sex = 'M';
        this.img = '';
        this.srcImg = '';
        this.google = false;
        this.codeReferal = '';

        this.userName = '';
        this.userPassword = '';
        this.userPassRepit = '';
        this.verifyReniec = false;
        this.brithDate = '';

        this.conditions = false;

        // DATOS DEL CONDUCTOR
        this.dateLicenseExpiration = '';
        this.categoryLicense = '';
        this.isEmployee = true;

        // DATOS DEL VEHICULO
        this.isProper = true;
        this.numberPlate = '';
        this.year = null; // new Date().getFullYear();
        this.color = 'GRAY';
        this.dateSoatExpiration = '';
    }
}
