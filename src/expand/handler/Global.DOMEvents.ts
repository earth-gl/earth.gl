import { Global } from './../Global';
/**
 * 合并申明
 * reference https://www.tslang.cn/docs/handbook/declaration-merging.html
 */
declare module './../Global' {
    interface Global {
        name: string;
        pluginFunc():void;
    }
}

Global.prototype.name = "ssss";

Global.prototype.pluginFunc = function(){
    const ctx = (this as Global);
    ctx.name = "ssss1";
}

Global.RegistHook(Global.prototype.pluginFunc);