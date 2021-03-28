import { IRenderer } from "../render/IRenderer";

/**
 * https://github.com/pixijs/pixi.js/blob/dev/packages/display/src/Container.ts
 * 
 * 绘图板作为渲染容器，汇聚各个加入到了Globe中的对象
 * 作为地理可视化库，
 * -有且仅支持解析地理矢量要素对象
 * -所有待绘制的对象都是一个人Sketchpad的子集
 */
 class CanvasLayer {
 
    constructor(renderer:IRenderer){
        
    }
}

export { CanvasLayer }