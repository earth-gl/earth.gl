import { EventEmitter } from 'events';
import { Camera } from './../camera/Camera';
import { QuadtreeTileSchema } from './QuadtreeTileSchema';

/**
 * 支持的事件类型
 */
const enum EventName {
    TileUpdated = "TileUpdated"
}

/**
 * 四叉树记载了
 * -全部在Camera范围内的出现过的瓦片
 * -当前Camera范围内的瓦片
 * -瓦片的父级信息
 */
class Quadtree extends EventEmitter {
    constructor() {
        super();
    }

    public update() {
        this.emit('hi');
    }
}

export { Quadtree }