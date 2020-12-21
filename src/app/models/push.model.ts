export class PushModel {
    title: string;
    message: string;
    osId: string[];
    data: any;
    template_id: string;

    constructor() {
        this.title = '';
        this.message = '';
        this.osId = [''];
        this.data = {};
        this.template_id = '';
    }
}
