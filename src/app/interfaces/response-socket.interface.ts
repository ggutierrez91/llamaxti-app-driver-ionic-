export interface IResSocket {
    ok: boolean;
    error?: any;
    message?: string;
    data?: any;
    showError?: number;
}


export interface IResSocketCoors {
    ok: boolean;
    message: string;
    indexHex?: string;
    error?: any;
}


export interface IResDisposal {
    pkService: number;
    msg: string;
    indexHex: string;
    fkUserDriver?: number;
}
