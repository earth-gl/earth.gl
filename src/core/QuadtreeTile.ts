import { QuadtreeTileSchema } from "./QuadtreeTileSchema";
import { Rectangle } from "./Rectangle";

/**
 * 四叉树形式的Tile组织，用于快速检索瓦片信息
 * @class
 */
class QuadtreeTile {
    /**
     * 
     */
    private _parent: QuadtreeTile;
    /**
     * 
     */
    private _level: number;
    /**
     * 
     */
    private _y: number;
    /**
     * 
     */
    private _x: number;
    /**
     * 
     */
    private _quadtreeTileSchema: QuadtreeTileSchema;
    /**
     * 
     */
    private _southwestChild: QuadtreeTile;
    /**
     * 
     */
    private _southeastChild: QuadtreeTile;
    /**
     * 
     */
    private _northwestChild: QuadtreeTile;
    /**
     * 
     */
    private _northeastChild: QuadtreeTile;
    /**
     * 该瓦片地理范围
     */
    private _boundary: Rectangle;
    /**
     * 
     * @param quadtreeTileSchema 瓦片投影计算模式，一般采用Web墨卡托Schema
     * @param x 
     * @param y 
     * @param level 
     * @param parent 
     */
    constructor(quadtreeTileSchema: QuadtreeTileSchema, x: number, y: number, level: number, parent: QuadtreeTile) {
        this._quadtreeTileSchema = quadtreeTileSchema;
        this._x = x;
        this._y = y;
        this._level = level;
        this._parent = parent;
        this._boundary = this._quadtreeTileSchema.tileXYToRectangle(x, y, level);
    }
    /**
     * 
     */
    get boundary(): Rectangle {
        const tileSchema = this._quadtreeTileSchema,
            x = this._x,
            y = this._y,
            l = this._level;
        return tileSchema.tileXYToRectangle(x, y, l);
    }
    /**
     * 
     */
    get level(): number {
        return this._level;
    }
    /**
     * foreach quard tree
     */
    get children(): QuadtreeTile[] {
        return [this.northwestChild, this.northeastChild, this.southwestChild, this.southeastChild];
    }
    /**
     * Gets the southwest child tile.
     */
    get southwestChild(): QuadtreeTile {
        this._southwestChild = this._southwestChild || new QuadtreeTile(
            this._quadtreeTileSchema,
            this._x * 2,
            this._y * 2 + 1,
            this._level + 1,
            this);
        return this._southwestChild;
    }
    /**
     * Gets the southeast child tile.
     */
    get southeastChild(): QuadtreeTile {
        this._southeastChild = this._southeastChild || new QuadtreeTile(
            this._quadtreeTileSchema,
            this._x * 2 + 1,
            this._y * 2 + 1,
            this._level + 1,
            this);
        return this._southeastChild;
    }
    /**
     * Gets the northwest child tile.
     */
    get northwestChild(): QuadtreeTile {
        this._northwestChild = this._northwestChild || new QuadtreeTile(
            this._quadtreeTileSchema,
            this._x * 2,
            this._y * 2,
            this._level + 1,
            this);
        return this._northwestChild;
    }
    /**
     * Gets the northeast child tile.
     */
    get northeastChild(): QuadtreeTile {
        this._northeastChild = this._northeastChild || new QuadtreeTile(
            this._quadtreeTileSchema,
            this._x * 2 + 1,
            this._y * 2,
            this._level + 1,
            this);
        return this._northeastChild;
    }
}

export { QuadtreeTile }