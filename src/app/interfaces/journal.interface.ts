export default interface IJournal {
    pkJournalDriver: number;
    codeJournal: string;
    fkConfigJournal: number;
    dateStart: string;
    dateEnd: string;

    nameJournal: string;
    rateJournal: number;
    modeJournal: string;
    paidOut: boolean;

    datePaid: string;
    illPay: boolean;
    cardCulqui: string;
    chargeAmount: number;
    totalCash: number;
    totalCard: number;
    totalCredit: number;
    totalDiscount: number;
    totalFn: number;
    countService: number;

    expired?: boolean;
    dateExpired?: string;
}
