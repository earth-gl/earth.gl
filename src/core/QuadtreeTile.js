/**
 * 瓦片，记录瓦片的rectangle等信息
 */
class QuadtreeTile {

    /**
     * @param {Number} options.x
     * @param {Number} options.y
     * @param {Number} options.level
     * @param {Number} [options.url]
     * @param {QuadtreeTile} [options.parent]
     * @param {QuadtreeTileSchema} [options.quadtreeTileSchema]
     */
    constructor(options) {
        /**
         * set default
         * @typedef {import("./QuadtreeTileSchema")} QuadtreeTileSchema
         * @type {QuadtreeTileSchema}
         */
        this._quadtreeTileSchema = options.quadtreeTileSchema;
        /**
         * @type {Number}
         */
        this.x = options.x;
        /**
         * @type {Number}
         */
        this.y = options.y;
        /**
         * @type {Number}
         */
        this.level = options.level;
        /**
         * @type {QuadtreeTile}
         */
        this.parent = options.parent;
        /**
         * @type {Rectangle}
         */
        this.boundary = this._calcuteBoundary(this.x, this.y, this.level);
    }
    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} level 
     * @returns {Rectangle}
     */
    _calcuteBoundary(x, y, level) {
        const tileSchema = this._quadtreeTileSchema;
        return tileSchema.tileXYToRectangle(x, y, level);
    }
    /**
     * 
     */
    get children() {
        return [this.northwestChild, this.northeastChild, this.southwestChild, this.southeastChild];
    }
    /**
     * foreach quard tree(southwets child)
     */
    get southwestChild() {
        this._southwestChild = this._southwestChild || new QuadtreeTile({
            x: this.x * 2,
            y: this.y * 2 + 1,
            level: this.level + 1,
            quadtreeTileSchema: this._quadtreeTileSchema,
            parent: this
        });
        return this._southwestChild;
    }
    /**
     * 
     */
    get southeastChild() {
        this._southeastChild = this._southeastChild || new QuadtreeTile({
            x: this.x * 2 + 1,
            y: this.y * 2 + 1,
            level: this.level + 1,
            quadtreeTileSchema: this._quadtreeTileSchema,
            parent: this
        });
        return this._southeastChild;
    }
    /**
     * Gets the northwest child tile.
     * @memberof QuadtreeTile.prototype
     * @type {QuadtreeTile}
     */
    get northwestChild() {
        this._northwestChild = this._northwestChild || new QuadtreeTile({
            x: this.x * 2,
            y: this.y * 2,
            level: this.level + 1,
            quadtreeTileSchema: this._quadtreeTileSchema,
            parent: this
        });
        return this._northwestChild;
    }
    /**
     * Gets the northeast child tile.
     * @memberof QuadtreeTile.prototype
     * @type {QuadtreeTile}
     */
    get northeastChild() {
        this._northeastChild = this._northeastChild || new QuadtreeTile({
            x: this.x * 2 + 1,
            y: this.y * 2,
            level: this.level + 1,
            quadtreeTileSchema: this._quadtreeTileSchema,
            parent: this
        });
        return this._northeastChild;
    }
}

module.exports = QuadtreeTile;