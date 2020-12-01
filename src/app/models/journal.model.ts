export class JournalModel {

    fkConfJournal: number;
    nameJournal: string;
    rateJournal: number;
    modeJournal: string;
    advancePayment: boolean;
    cardCulqui: string;
    chargeAmount: number;
    cardTkn: string;

    constructor() {

        this.fkConfJournal = null;
        this.nameJournal = '';
        this.rateJournal = 0;
        this.modeJournal = '';
        this.advancePayment = false;

        this.cardCulqui = '';

        this.chargeAmount = 0;
        // this.cardTkn = '';
    }

    onReset() {

        this.fkConfJournal = null;
        this.nameJournal = '';
        this.rateJournal = 0;
        this.modeJournal = '';
        this.advancePayment = false;

        this.cardCulqui = '';

        this.chargeAmount = 0;
    }
}


export class CloseJournalModel {

    pkJournal: number;
    cardCulqui: string;
    chargeAmount: number;
    cardTkn: string;

    constructor() {
        this.pkJournal = 0;
        this.cardCulqui = '';
        this.chargeAmount = 0;
        this.cardTkn = '';
    }
}
