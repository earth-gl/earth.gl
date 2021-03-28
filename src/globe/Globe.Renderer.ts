import { Globe } from './Globe';
import { CanvasLayer } from '../layer/CanvasLayer';


declare module './Globe' {
    interface Globe {
        addLayer(layer: CanvasLayer): void;
    }
}

Globe.prototype.addLayer = function (layer: CanvasLayer): void {

}