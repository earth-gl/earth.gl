import { Globe } from './Globe';
import './Globe.Camera'

declare module './Globe' {
    interface Globe {
        registerTMS():void;
    }
}

Globe.prototype.registerTMS = function():void{
    const ctx = this as Globe;
    console.log(ctx.camera);
}


Globe.RegistHook(Globe.prototype.registerTMS);