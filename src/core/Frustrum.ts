/**
 * 视锥对象
 */
class Frustrum {
    /**
     * 
     */
    private _fovy: number;
    /**
     * aspect ratio
     */
    private _aspect: number;
    /**
     * 
     */
    public top: number;
    /**
     * 
     */
    public bottom: number;
    /**
     * 
     */
    public left: number;
    /**
     * 
     */
    public right: number;
    /**
     * 
     */
    public sseDenominator: number;
    /**
     * @param fovy 
     * @param aspect 
     */
    constructor(fovy: number, aspect: number) {
        this._aspect = aspect;
        this._fovy = fovy;
    }
    /**
     * 
     * @param top 
     */
    updateFrustrum(top: number): void {
        this.top = top;
        this.bottom = -top;
        this.right = this._aspect * top;
        this.left = -this.right;
        this.sseDenominator = 2.0 * Math.tan(0.5 * this._fovy);
    }
}

export { Frustrum };