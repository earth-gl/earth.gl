import { Vec3 } from "kiwi.matrix";
import { Ellipsoid } from './Ellipsoid';
import { Geographic } from "./Geographic";
/**
 * 投影类
 * @class
 */
abstract class Projection {
    /**
     * 参考椭球
     */
    private _ellipsoid: Ellipsoid;
    /**
     * 
     */
    protected _semimajorAxis: number;
    /**
     * 
     */
    protected _oneOverSemimajorAxis: number;
    /**
     * 
     */
    protected _maximumLatitude: number;
    /**
     * 
     * @param options 
     */
    constructor(ellipsoid: Ellipsoid, maximumLatitude: number = Math.PI / 2) {
        this._ellipsoid = ellipsoid;
        this._semimajorAxis = this._ellipsoid.maximumRadius;
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis;
        this._maximumLatitude = maximumLatitude;
    }
    /**
     * @type {Ellipsoid}
     */
    get ellipsoid() {
        return this._ellipsoid;
    }
    /**
     * 
     * @param geographic geographic in radius
     */
    abstract project(geographic: Geographic): Vec3;
    /**
     * 
     * @param v3 
     */
    abstract unproject(v3: Vec3): Geographic;
}

export { Projection }