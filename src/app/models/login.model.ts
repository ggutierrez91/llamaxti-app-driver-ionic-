
export class LoginModel  {
    pkUser: number;

    userName: string;
    userPassword: string;
    remenberMe: boolean;

    constructor() {
        this.userName = '';
        this.userPassword = '';
        this.remenberMe  = false;
    }
}
