export interface IProfile {
    pkPerson?: number;
    pkUser?: number;
    fkNationality?: number;
    fkTypeDocument?: number;
    name?: string;
    surname?: string;
    nameComplete?: string;
    document?: string;
    phone?: string;
    email?: string;
    brithDate?: string;
    sex?: string;
    sexText?: string;
    img: string;
    city?: string;
    aboutMe?: string;
    nameCountry?: string;
    prefixPhone?: string;
    nameDocument?: string;
    prefix?: string;
    dateVerified?: string;
    dateRegister?: string;
    userName?: string;
    yearsOld: number;

    pkDriver?: number;
    dateLicenseExpiration?: string;
    imgLicense?: string;
    isEmployee?: boolean;
    imgPhotoCheck?: string;
    imgCriminalRecord?: string;
    imgPolicialRecord?: string;

}
