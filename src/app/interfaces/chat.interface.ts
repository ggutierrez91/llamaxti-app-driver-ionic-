export interface IChat {
    uid?: string;
    fkService: number;
    fkUser: number;
    nameComplete: string;
    messsage: string;
    created: string;
    createdFire: Date;
}
