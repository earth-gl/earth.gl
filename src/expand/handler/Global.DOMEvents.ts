import { Global } from './../Global';

declare module './../Global' {
    interface Global {
        name:string;
    }
}

Global.prototype.name = "ssss";