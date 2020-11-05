export default interface IJournal {
    pkJournalDriver: number;
    codeJournal: string;
    fkConfigJournal: number;
    dateStart: string;
    dateEnd: string;
    totalJournal: number;
    countService: number;
    nameJournal: string;
    rateJournal: number;
    modeJournal: string;
    expired?: boolean;
    dateExpired?: string;
}
