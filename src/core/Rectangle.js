const TWO_PI = 2 * PI,
    EPSILON14 = 0.00000000000001;
/**
 * 
 * @param {Number} m 
 * @param {Number} n 
 */
const mod = function (m, n) {
    return ((m % n) + n) % n;
};
/**
 * 
 * @param {Number} angle 
 */
const zeroToTwoPi = function (angle) {
    var mod = mod(angle, TWO_PI);
    if (Math.abs(mod) < EPSILON14 && Math.abs(angle) > EPSILON14) {
        return TWO_PI;
    }
    return mod;
};
/**
 * 
 * @param {Number} angle 
 */
const negativePiToPi = function (angle) {
    return zeroToTwoPi(angle + Math.PI) - Math.PI;
};
/**
 * @class
 */
class Rectangle {
    /**
     * 
     * @param {Number} west 
     * @param {Number} south 
     * @param {Number} east 
     * @param {Number} north 
     */
    constructor(west, south, east, north) {
        /**
         * 
         */
        this.west = west;
        /**
         * 
         */
        this.south = south;
        /**
         * 
         */
        this.east = east;
        /**
         * 
         */
        this.north = north;
    }
    /**
     * 
     */
    _computeWidth() {
        const east = this.east,
            west = this.west;
        return east < west ? east + TWO_PI - west : east - west;
    }
    /**
     * 
     */
    _computeHeight() {
        const north = this.north,
            south = this.south;
        return north - south;
    }
    /**
     * 
     */
    get southwest() {
        return {
            longitude: this.west,
            latitude: this.south,
            height: 0.0
        }
    }
    /**
     * 
     */
    get northwest() {
        return {
            longitude: this.west,
            latitude: this.north,
            height: 0.0
        }
    }
    /**
     * 
     */
    get northeast() {
        return {
            longitude: this.east,
            latitude: this.north,
            height: 0.0
        }
    }
    /**
     * 
     */
    get southeast() {
        return {
            longitude: this.east,
            latitude: this.south,
            height: 0.0
        }
    }
    /**
     * 
     */
    get center() {
        var east = this.east,
            west = this.west,
            south = this.south,
            north = this.north;
        //
        east = east < west ? east + TWO_PI : east;
        const longitude = negativePiToPi((west + east) * 0.5);
        const latitude = (south + north) * 0.5;
        return {
            longitude: longitude,
            latitude: latitude,
            height: 0.0
        }
    }
}

module.exports = Rectangle;