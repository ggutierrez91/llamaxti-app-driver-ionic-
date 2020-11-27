export interface IUerSocket {
    pkUser: number;
    userName: string;
    nameComplete: string;
    role: string;
    osID: string;
    device: string;
    pkCategory: number;
    codeCategory: string;
    occupied: boolean;
    playGeo: boolean;
}


export interface INationality {
    pkNationality: number;
    nameCountry: string;
    prefixPhone: string;
    isoAlfaTwo: string;
}
