import { GLMatrix } from 'kiwi.matrix';
import { GeodeticCoordinate } from './GeodeticCoordinate';
import { EPSILON } from './../util/fixed';

const TWO_PI = 2 * Math.PI;
/**
 * 求公约数
 * @param m 
 * @param n 
 */
const modValue = function (m: number, n: number): number {
    return ((m % n) + n) % n;
};
/**
 * 
 * @param angle in radian
 */
const zeroToTwoPi = function (angle: number) {
    const mod = modValue(angle, TWO_PI);
    return Math.abs(mod) < EPSILON.EPSILON14 && Math.abs(angle) > EPSILON.EPSILON14 ? TWO_PI : mod;
};
/**
 * 
 * @param angle in radian
 */
const negativePiToPi = function (angle: number): number {
    return zeroToTwoPi(angle + Math.PI) - Math.PI;
};
/**
 * 基于大地坐标表示的地理范围
 * @class
 */
class Rectangle {
    /**
     * left side position in meters
     */
    private _west: number;
    /**
     * bottom side position in meters
     */
    private _south: number;
    /**
     * right side position in meters
     */
    private _east: number;
    /**
     * top side position in meters
     */
    private _north: number;
    /**
     * -支持使用经纬度表示的地理范围
     * @param sw southwest 经纬度表示(degree)
     * @param ne northeast 经纬度表示(degree)
     */
    constructor(sw: GeodeticCoordinate, ne: GeodeticCoordinate) {
        this._south = sw.latitude;
        this._west = sw.longitude;
        this._north = ne.latitude;
        this._east = ne.longitude;
    }
    /**
     * 地理范围最大值
     */
    static MAX_VALUE = new Rectangle(new GeodeticCoordinate(-180, -90), new GeodeticCoordinate(180, 90));
    /**
     * 
     */
    get bounds(): Array<GeodeticCoordinate> {
        return [this.southwest, this.northwest, this.northeast, this.southeast];
    }
    /**
     * get southwets in radians
     */
    get southwest(): GeodeticCoordinate {
        return new GeodeticCoordinate(this._west, this._south, 0.0);
    }
    /**
    * get north west in radians
    */
    get northwest(): GeodeticCoordinate {
        return new GeodeticCoordinate(this._west, this._north, 0.0);
    }
    /**
     * 
     */
    get northeast(): GeodeticCoordinate {
        return new GeodeticCoordinate(this._east, this._north, 0.0);
    }
    /**
     * get sourheast in radians
     */
    get southeast(): GeodeticCoordinate {
        return new GeodeticCoordinate(this._east, this._south, 0.0);
    }
    /**
     * get center of rectangle
     */
    get center(): GeodeticCoordinate {
        const west = GLMatrix.toRadian(this._west),
            south = GLMatrix.toRadian(this._south),
            north = GLMatrix.toRadian(this._north);
        let east = GLMatrix.toRadian(this._east);
        east = east < west ? east + TWO_PI : east;
        const longitude = negativePiToPi((west + east) * 0.5);
        const latitude = (south + north) * 0.5;
        return new GeodeticCoordinate(GLMatrix.toDegree(longitude), GLMatrix.toDegree(latitude), 0.0);
    }
    /**
     * 计算地理坐标是否在范围内
     * @param geodeticCoordinate 
     */
    contain(geodeticCoordinate: GeodeticCoordinate): boolean {
        const lng = geodeticCoordinate.longitude, lat = geodeticCoordinate.latitude;
        const west = GLMatrix.toRadian(this._west),
            south = GLMatrix.toRadian(this._south),
            north = GLMatrix.toRadian(this._north);
        let east = GLMatrix.toRadian(this._east);
        east = east < west ? east + TWO_PI : east;
        return (lng > west || Math.abs(lng - west) <= EPSILON.EPSILON14) &&
            (lng < east || Math.abs(lng - east) <= EPSILON.EPSILON14) &&
            lat >= south &&
            lat <= north;
    }
}

export { Rectangle }