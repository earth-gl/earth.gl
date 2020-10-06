
import { IObject3D } from '../types';
import { stamp } from '../utils/stamp';

export class Object3D implements IObject3D {
    /**
     * 
     */
    public readonly id: string;

    /**
     * 默认初始化函数
     */
    public constructor() {
        this.id = stamp(this);
    }

}
