export default interface IVehicle {
    pkVehicle: number;
    fkCategory: number;
    fkBrand: number;
    fkModel: number;
    imgSoat: string;
    dateSoatExpiration: string;
    color: string;
    numberPlate: string;
    year: number;
    imgPropertyCard: string;
    imgTaxiBack: string;
    imgTaxiFrontal: string;
    imgTaxiInterior: string;
    isProper: number;
    dateRegister: string;
    verified: number;
    dateVerified: string;
    statusRegister: number;
    nameCategory: string;
    nameBrand: string;
    driverUsing: number;
}

