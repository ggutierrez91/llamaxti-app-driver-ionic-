export class VehicleModel {
    pkVehicle: number;
    numberPlate: string;
    year: number;
    color: string;
    colorEs: string;
    dateSoatExpiration: string;
    isProper: boolean;

    constructor() {
        this.pkVehicle = 0;
        this.numberPlate = '';
        this.year = 2015;
        this.color = 'BLACK';
        this.colorEs = 'NEGRO';
        this.dateSoatExpiration = '';
        this.isProper = true;
    }
}
