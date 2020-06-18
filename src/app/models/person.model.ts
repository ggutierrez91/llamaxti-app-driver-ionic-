export abstract class PersonModel {
    pkPerson?: number;
    fkTypeDocument: number;
    fkNationality: number;
    document: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    brithDate?: string;
    sex: string;
    img: string;
    srcImg?: string;

}


