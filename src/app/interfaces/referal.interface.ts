export interface IAmountRef {
    pkConfigReferal: number;
    amountClient: number;
    bonusCliRef: number;
    amountDriver: number;
    bonusDriRef: number;
    daysExpClient: number;
    daysExpDriver: number;
}


export interface IReferal {
    pkReferalUser: number;
    bonus: number;
    bonusUsed: number;
    bonusVigent: number;
    dateExpiration: string;
    nameRefered: string;
    dateRegister: string;
    dateUsed: string;
}
