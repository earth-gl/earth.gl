import { Ellipsoid } from './Ellipsoid';
import { GeodeticCoordinate } from "./GeodeticCoordinate";
import { GLMatrix, Vec3 } from 'kiwi.matrix';
import { sin, log, atan, exp } from '../util/fixed';
import { PSEUDOMERCATOR } from './Ellipsoid';

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
    abstract project(geographic: GeodeticCoordinate): Vec3;
    /**
     * 
     * @param v3 
     */
    abstract unproject(v3: Vec3): GeodeticCoordinate;
}




const maxLatitude = 85.0511287798;
/**
 * Web墨卡托投影
 * @author yellow
 */
class WebMercatorProjection extends Projection {
    constructor() {
        super(PSEUDOMERCATOR, maxLatitude);
        //减少一次运算，结果和maxLatitude一致
        //this._maximumLatitude = this._mercatorAngleToGeodeticLatitude(Math.PI);
    }
    /**
     * Converts a Mercator angle, in the range -PI to PI, to a geodetic latitude in the range -PI/2 to PI/2.
     * @param mercatorAngle in radius
     */
    private _mercatorAngleToGeodeticLatitude(mercatorAngle: number): number {
        return Math.PI / 2 - (2.0 * atan(exp(-mercatorAngle)));
    }
    /**
     * 
     * @param latitude 
     */
    private _geodeticLatitudeToMercatorAngle(latitude: number): number {
        const maximumLatitude = this._maximumLatitude;
        if (latitude > maximumLatitude)
            latitude = maximumLatitude;
        else if (latitude < -maximumLatitude)
            latitude = -maximumLatitude;
        const sinLatitude = sin(latitude);
        return 0.5 * log((1.0 + sinLatitude) / (1.0 - sinLatitude));
    }
    /**
     * 
     * @param geographic 
     */
    project(geographic: GeodeticCoordinate): Vec3 {
        const semimajorAxis = this._semimajorAxis;
        const x = GLMatrix.toRadian(geographic.longitude) * semimajorAxis,
            y = this._geodeticLatitudeToMercatorAngle(GLMatrix.toRadian(geographic.latitude)) * semimajorAxis,
            z = geographic.height;
        return new Vec3().set(x, y, z);
    }
    /**
     * 
     * @param v3 
     */
    unproject(v3: Vec3): GeodeticCoordinate {
        const oneOverEarthSemimajorAxis = this._oneOverSemimajorAxis,
            longitude = v3.x * oneOverEarthSemimajorAxis,
            latitude = this._mercatorAngleToGeodeticLatitude(v3.y * oneOverEarthSemimajorAxis),
            height = v3.z;
        return new GeodeticCoordinate(GLMatrix.toDegree(longitude), GLMatrix.toDegree(latitude), height);
    }
}

export { Projection, WebMercatorProjection }