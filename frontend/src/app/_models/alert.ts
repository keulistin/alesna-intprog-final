export class Alert {
    id: string;
    type: string;
    message: string;
    autoClose: boolean;
    keepAfterRouteChange: boolean;
    fade: boolean

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}