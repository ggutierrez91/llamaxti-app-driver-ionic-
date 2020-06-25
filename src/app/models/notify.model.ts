export class NotyModel {

    pkNotification?: number;
    fkUserEmisor: number;
    fkUserReceptor: number;
    notificationTitle: string;
    notificationSubTitle: string;
    notificationMessage: string;
    urlShow: string;

    constructor(url: string, pkEmisor: number) {
        this.pkNotification = 0;
        this.fkUserEmisor = pkEmisor;
        this.fkUserReceptor = 0;
        this.notificationTitle = '';
        this.notificationSubTitle = '';
        this.notificationMessage = '';
        this.urlShow = url;
    }
}
