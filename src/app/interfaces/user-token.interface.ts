export interface IUserToken {
    pkUser: number;
    pkDriver: number;
    pkPerson: number;
    userName?: string;
    name?: string;
    surname?: string;
    nameComplete?: string;
    // prefix?: string;
    // nameCountry?: string;
    // document?: string;
    email?: string;
    phone?: string;
    img?: string;
    role: string;
}
