import { Sketchpad } from '../Sketchpad';
import { WebGLOptions } from '../webgl/GUtil';
import { Camera } from '../../camera/Camera';
import { Globe } from '../../globe/Globe';
import { IRendererOS } from '../IRendererOS';

/**
 * renderer implemention
 */
class SketchpadRenderer implements IRendererOS {

    /** 
     * 全局渲染对象 
     */
    protected _gl: WebGLRenderingContext;

    /** 
     * 图层，数据管理 
     */
    protected _skpd: Sketchpad;

    /** 
     * canvas 元素 
     */
    protected _canvas: OffscreenCanvas;

    /** 
     * Globe 对象 
     */
    protected _g: Globe;

    /**
     * 
     * @param skpd 
     * @param opt 
     */
    constructor(skpd: Sketchpad, opt = WebGLOptions) {
        this._skpd = skpd;
        this._g = skpd.Globe;
        this._canvas = this._createCanvas();
        this._gl = this._canvas.getContext('webgl', opt) as WebGLRenderingContext;
        //分辨率统一
        const gl = this._gl,
            g = this._g,
            w = g.width,
            h = g.height,
            r = g.devicePixelRatio;
        gl.viewport(0, 0, w * r, h * r);
        //}{debug 添加canvas在页面上方便查看融合效果
        // document.body.appendChild(this._canvas);
    }

    /* 
     * 构造不载入显示的htmlcanvas 
     */
    _createCanvas = (): OffscreenCanvas => {
        if (this._canvas) return this._canvas;
        const g = this._g,
            r = g.devicePixelRatio,
            w = g.width,
            h = g.height,
            rw = r * w,
            rh = r * h;
        const canvas = new OffscreenCanvas(rw, rh);
        return canvas;
    }

    /*
     * 渲染结果 
     */
    getCanvasImage = (): ImageBitmap => {
        //1. canvas 区域
        return this._canvas.transferToImageBitmap();
    }

    /* 
     * 渲染 
     */
    render = (framestamp: number, camera: Camera) => {
        //通用渲染部分
        const gl = this._gl;
        //gl state clear
        gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);
        //剔除（Culling）提高渲染性能。默认开启背面渲染剔除（Backface Culling)
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //执行自己的绘制逻辑
        this._render ? this._render(this._gl, framestamp, camera) : null;
    }

    /*
     * primitive 处理阶段 
     */
    preparePrimitives = (...args: any): void => {

    }

    /**
     * feature 排序
     * @param args 
     */
    sortPrimitives = (...args: any): void => {

    }

    /* 
     * 私有渲染部分，各自逻辑覆写
     */
    _render = (gl: WebGLRenderingContext, framestamp: number, camera: Camera) => {

    }
}

Sketchpad.registerRenderer(Sketchpad.name, SketchpadRenderer);

export { SketchpadRenderer }
