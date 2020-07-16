export class PushModel {
    title: string;
    message: string;
    osId: string[];
    data: any;

    constructor() {
        this.title = '';
        this.message = '';
        this.osId = [''];
        this.data = {};
    }
}
