import { Vec3 } from 'kiwi.matrix';
import { Globe } from '../Globe';

declare module './Globe' {
  interface Globe {
    fly(to: Vec3): void;
  }
}

Globe.prototype.fly = function (to: Vec3): void {

}