import { Geographic } from './Geographic';
import { Vec3 } from 'kiwi.matrix';
import { sin, cos, EPSILON, PHYSICAL_CONSTANT } from './../utils/umath';

//最长半长轴
const semimajorAxis = Math.max(PHYSICAL_CONSTANT.EARTH_RADIUS_X, PHYSICAL_CONSTANT.EARTH_RADIUS_Y, PHYSICAL_CONSTANT.EARTH_RADIUS_Z);
/**
 * @description 椭球体
 * @class 
 */
class Ellipsoid {
    /**
     * 
     */
    public x: number;
    /**
     * 
     */
    public y: number;
    /**
     * 
     */
    public z: number;
    /**
     * 
     */
    private _radii: Vec3;
    /**
     * 
     */
    private _radiiSquared: Vec3;
    /**
     * 
     */
    private _oneOverRadii: Vec3;
    /**
     * 
     */
    private _oneOverRadiiSquared: Vec3;
    /**
     * 
     */
    private _oneOverMaximumRadius: number;
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this._radii = new Vec3().set(x, y, z);
        this._radiiSquared = new Vec3().set(x * x, y * y, z * z);
        this._oneOverRadii = new Vec3().set(1 / x, 1 / y, 1 / z);
        this._oneOverRadiiSquared = new Vec3().set(1 / (x * x), 1 / (y * y), 1 / (z * z));
        this._oneOverMaximumRadius = 1 / this.maximumRadius;
    }
    /**
     * @type {Vec3}
     */
    get radiiSquared() {
        return this._radiiSquared;
    }
    /**
     * @type {Vec3}
     */
    get radii() {
        return this._radii;
    }
    /**
     * @type {Vec3}
     */
    get oneOverRadii() {
        return this._oneOverRadii;
    }
    /**
     * @type {Number}
     */
    get maximumRadius() {
        return Math.max(this.x, this.y, this.z);
    }
    /**
     * @type {Number}
     */
    get oneOverMaximumRadius() {
        return this._oneOverMaximumRadius;
    }
    /**
     * 地理坐标转化成空间向量，从(0,0,0)指向地球表明的方向向量
     * @param cartographic 
     */
    private _geodeticSurfaceNormalCartographic(cartographic: Geographic): Vec3 {
        const longitude = cartographic.longitude,
            latitude = cartographic.latitude,
            cosLatitude = cos(latitude);
        const x = cosLatitude * cos(longitude),
            y = cosLatitude * sin(longitude),
            z = sin(latitude);
        return new Vec3().set(x, y, z);
    }
    /**
     * 方向向量(x,y,z)转换到地球表明的空间坐标
     * @param cartesian 笛卡尔坐标系下的空间坐标x,y,z
     */
    private _geodeticSurfaceNormal(cartesian: Vec3): Vec3 {
        const oneOverRadiiSquared = this._oneOverRadiiSquared;
        const result = cartesian.clone().multiply(oneOverRadiiSquared);
        return result.normalize();
    }
    /**
     * 将空间坐标按照比例缩放到椭球体上
     * @type {Vec3} position
     */
    private _scaleToGeodeticSurface(position: Vec3): Vec3 {
        //
        var positionX = position.x;
        var positionY = position.y;
        var positionZ = position.z;
        //
        const oneOverRadii = this._oneOverRadii;
        var oneOverRadiiX = oneOverRadii.x;
        var oneOverRadiiY = oneOverRadii.y;
        var oneOverRadiiZ = oneOverRadii.z;
        //
        var x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX;
        var y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY;
        var z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ;
        // Compute the squared ellipsoid norm.
        var squaredNorm = x2 + y2 + z2;
        var ratio = Math.sqrt(1.0 / squaredNorm);
        // As an initial approximation, assume that the radial intersection is the projection point.
        var intersection = position.clone().scale(ratio);
        // If the position is near the center, the iteration will not converge.
        if (squaredNorm < EPSILON.EPSILON1) {
            return !isFinite(ratio) ? undefined : intersection.clone();
        }
        const oneOverRadiiSquared = this._oneOverRadiiSquared;
        var oneOverRadiiSquaredX = oneOverRadiiSquared.x;
        var oneOverRadiiSquaredY = oneOverRadiiSquared.y;
        var oneOverRadiiSquaredZ = oneOverRadiiSquared.z;
        // Use the gradient at the intersection point in place of the true unit normal.
        // The difference in magnitude will be absorbed in the multiplier.
        var gradient = new Vec3().set(
            intersection.x * oneOverRadiiSquaredX * 2.0,
            intersection.y * oneOverRadiiSquaredY * 2.0,
            intersection.z * oneOverRadiiSquaredZ * 2.0
        );
        // Compute the initial guess at the normal vector multiplier, lambda.
        var lambda = (1.0 - ratio) * position.len() / (0.5 * gradient.len());
        var correction = 0.0;
        var func;
        var denominator;
        var xMultiplier;
        var yMultiplier;
        var zMultiplier;
        var xMultiplier2;
        var yMultiplier2;
        var zMultiplier2;
        var xMultiplier3;
        var yMultiplier3;
        var zMultiplier3;
        do {
            lambda -= correction;
            xMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredX);
            yMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredY);
            zMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredZ);
            xMultiplier2 = xMultiplier * xMultiplier;
            yMultiplier2 = yMultiplier * yMultiplier;
            zMultiplier2 = zMultiplier * zMultiplier;
            xMultiplier3 = xMultiplier2 * xMultiplier;
            yMultiplier3 = yMultiplier2 * yMultiplier;
            zMultiplier3 = zMultiplier2 * zMultiplier;
            func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0;
            // "denominator" here refers to the use of this expression in the velocity and acceleration
            // computations in the sections to follow.
            denominator = x2 * xMultiplier3 * oneOverRadiiSquaredX + y2 * yMultiplier3 * oneOverRadiiSquaredY + z2 * zMultiplier3 * oneOverRadiiSquaredZ;
            var derivative = -2.0 * denominator;
            correction = func / derivative;
        } while (Math.abs(func) > EPSILON.EPSILON12);
        //
        return new Vec3().set(positionX * xMultiplier, positionY * yMultiplier, positionZ * zMultiplier);
    }
    /**
     * Scales the provided Cartesian position 
     * along the geodetic surface normal so 
     * that it is on the surface of this ellipsoid.  
     * If the position is at the center of the 
     * ellipsoid, this function returns undefined.
     * @description 将空间坐标转成大地坐标
     * @example
     * position = new Vec3().set(17832.12, 83234.52, 952313.73);
     * cartographicPosition = WGS84.spaceToGeographic(position);
     * 
     */
    spaceToGeographic(spaceCoord: Vec3): Geographic {
        const p = this._scaleToGeodeticSurface(spaceCoord);
        const n = this._geodeticSurfaceNormal(p);
        const h = spaceCoord.clone().sub(p);
        var longitude = Math.atan2(n.y, n.x);
        var latitude = Math.asin(n.z);//resprent value in radian 
        var height = Math.sign(h.clone().dot(spaceCoord)) * h.len();
        return new Geographic(longitude, latitude, height);
    }
    /**
     * convert geographic coord to sapce coord (x, y, z)
     * @description 地理坐标转成空间坐标
     * @param {Geographic} geographic 
     */
    geographicToSpace(geographic: Geographic): Vec3 {
        const radiiSquared = this._radiiSquared,
            n = this._geodeticSurfaceNormalCartographic(geographic),
            k = radiiSquared.clone().multiply(n);
        const gamma = Math.sqrt(n.clone().dot(k));
        k.scale(1 / gamma);
        n.scale(geographic.height);
        return k.add(n);
    }
}

/**
 * WGS84参考椭球
 */
const WGS84 = new Ellipsoid(PHYSICAL_CONSTANT.EARTH_RADIUS_X, PHYSICAL_CONSTANT.EARTH_RADIUS_Y, PHYSICAL_CONSTANT.EARTH_RADIUS_Z);
/**
 * Web墨卡托的伪椭球（正圆）
 */
const PSEUDOMERCATOR = new Ellipsoid(semimajorAxis, semimajorAxis, semimajorAxis);

export { Ellipsoid, WGS84, PSEUDOMERCATOR }