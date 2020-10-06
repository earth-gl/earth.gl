export class App {

    private canvas: HTMLCanvasElement;

    private context: GPUCanvasContext;

    private device: GPUDevice;

    private adapter: GPUAdapter;

    private format: GPUTextureFormat = 'bgra8unorm';

    constructor(rootElement: HTMLElement) {
        const w = rootElement.clientWidth;
        const h = rootElement.clientHeight;
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        rootElement.appendChild(this.canvas);
    }

    /**
     * 初始化adapter
     */
    private async InitWebGPU() {

        this.adapter = await navigator.gpu?.requestAdapter({
            powerPreference: 'high-performance'
        });

        this.device = await this.adapter.requestDevice();
        //
        this.context = <unknown>this.canvas.getContext('gpupresent') as GPUCanvasContext;

        this.format = await this.context.getSwapChainPreferredFormat(this.device);
    }




}