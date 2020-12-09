export interface ILiquidation {
    pkLiquidation: number;
    codeLiquidation: string;
    operation: string;
    observation: string;
    fileOperation: string;
    amount: string;
    amountCompany: string;
    dateRegister: string;
    bankAlias: string;
    ccAccount: string;
    cciAccount: string;
}

export interface ILiqInfo {
    pkJournalDriver: number;
    codeJournal: string;
    countService: number;
    nameJournal: string;
    totalPay: number;
    paidOut: boolean;
    dateEnd: string;
    journalStatus: boolean;
}