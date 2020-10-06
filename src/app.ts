export class App {

    public canvas: HTMLCanvasElement;

    public context: GPUCanvasContext;

    constructor(rootElement: HTMLElement) {
        const w = rootElement.clientWidth;
        const h = rootElement.clientHeight;
        this.canvas =document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        rootElement.appendChild(this.canvas);
        this.context = <unknown>this.canvas.getContext('gpupresent') as GPUCanvasContext;
    }

}