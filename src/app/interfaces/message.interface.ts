export interface IMessage {
    pkMessage: number;
    fkUserEmisor: number;
    fkUserReceptor: number;
    subject: string;
    message: string;
    tags?: string;
    dateRegister: string;
    readed?: boolean;
    dateReaded?: string;

    nameEmisor: string;
    userEmisor: string;
    nameReceptor: string;

    imgEmisor: string;
    imgReceptor: string;
    totalResponses: number;
    totalResponseNoReaded?: number;
    sliceLength?: number;
    showMore?: boolean;
}
