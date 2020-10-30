import { Vec2, Vec4, Vec3 } from "kiwi.matrix";
import { Ellipsoid } from "../projection/Ellipsoid";
import { Projection } from "../projection/Projection";
import { Rectangle } from './Rectangle';

/**
 * 瓦片组织规范
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/f87fbadb79d8410deeb5c3f66228c235344a44f2/Source/Core/WebMercatorTilingScheme.js#L42
 */
class QuadtreeTileSchema {
    /**
     * 
     */
    private _numberOfLevelZeroTilesX: number;
    /**
     * 
     */
    private _numberOfLevelZeroTilesY: number;
    /**
     * 
     */
    private _projection: Projection;
    /**
     * 
     */
    private _ellipsoid: Ellipsoid;
    /**
     * 半轴xPi
     */
    private _semimajorAxisTimesPi: number;
    /**
     * 投影坐标表示的地理范围(西南)
     */
    private _rectangleSouthwestInMeters: Vec2;
    /**
     * 投影坐标表示的地理范围(东北)
     */
    private _rectangleNortheastInMeters: Vec2;
    /**
     * 
     * @param projection 
     * @param xNumber 
     * @param yNumber 
     */
    constructor(projection: Projection, xNumber: number = 1, yNumber: number = 1) {
        this._numberOfLevelZeroTilesX = xNumber | 1;
        this._numberOfLevelZeroTilesY = yNumber | 1;
        this._projection = projection;
        this._ellipsoid = projection.ellipsoid;
        this._semimajorAxisTimesPi = projection.ellipsoid.maximumRadius * Math.PI;
        this._rectangleSouthwestInMeters = new Vec2().set(-this._semimajorAxisTimesPi, -this._semimajorAxisTimesPi);
        this._rectangleNortheastInMeters = new Vec2().set(this._semimajorAxisTimesPi, this._semimajorAxisTimesPi);
    }
    /**
     * 
     * @param level 
     */
    getNumberOfXTilesAtLevel(level: number): number {
        return this._numberOfLevelZeroTilesX << level;
    }
    /**
     * 
     * @param level 
     */
    getNumberOfYTilesAtLevel(level: number): number {
        return this._numberOfLevelZeroTilesY << level;
    }
    /**
     * 将瓦片x,y,level编号计算成投影后的坐标范围
     * @param x 
     * @param y 
     * @param level 
     */
    tileXYToNativeRectangle(x: number, y: number, level: number): Vec4 {
        const xTiles = this.getNumberOfXTilesAtLevel(level),
            yTiles = this.getNumberOfYTilesAtLevel(level),
            xTileWidth = (this._rectangleNortheastInMeters.x - this._rectangleSouthwestInMeters.x) / xTiles;
        const west = this._rectangleSouthwestInMeters.x + x * xTileWidth,
            east = this._rectangleSouthwestInMeters.x + (x + 1) * xTileWidth,
            yTileHeight = (this._rectangleNortheastInMeters.y - this._rectangleSouthwestInMeters.y) / yTiles;
        const north = this._rectangleNortheastInMeters.y - y * yTileHeight,
            south = this._rectangleNortheastInMeters.y - (y + 1) * yTileHeight;
        return new Vec4().set(west, south, east, north);
    }
    /**
     * 
     * @param x 
     * @param y 
     * @param level 
     */
    tileXYToRectangle(x: number, y: number, level: number): Rectangle {
        const [west, south, east, north] = this.tileXYToNativeRectangle(x, y, level).value;
        const projection = this._projection;
        const sw = projection.unproject(new Vec3().set(west, south, 0));
        const ne = projection.unproject(new Vec3().set(east, north, 0));
        return new Rectangle(sw, ne);
    }
}

export { QuadtreeTileSchema }