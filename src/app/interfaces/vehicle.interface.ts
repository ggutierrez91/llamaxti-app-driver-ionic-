export default interface IVehicle {
    pkVehicle: number;
    fkDriver: number;
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
    srcTaxiFrontal: string;
    imgTaxiInterior: string;
    isProper: boolean;
    dateRegister: string;
    verified: number;
    dateVerified: string;
    statusRegister: number;
    nameCategory: string;
    nameBrand: string;
    driverUsing: number;
}

