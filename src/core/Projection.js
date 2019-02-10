const WGS84 = require('./Ellipsoid').WGS84,
    Geographic = require('./Geographic'),
    { Vec3 } = require('kiwi.matrix');

class Projection {
    /**
     * @param {Object} [options]
     * @param {Ellipsoid} [options.ellipsoid]
     */
    constructor(options = {}) {
        /**
         * @type {Ellipsoid}
         */
        this._ellipsoid = WGS84;
        /**
         * @type {Number}
         */
        this._semimajorAxis = this._ellipsoid.maximumRadius;
        /**
         * @type {Number}
         */
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis;
        /**
         * 
         */
        this._maximumLatitude = options.maximumLatitude || Math.PI / 2;
    }
    /**
     * @type {Ellipsoid}
     */
    get ellipsoid() {
        return this._ellipsoid;
    }
    /**
     * @param {Geographic} geographic in radius
     */
    project(geographic) {
        return new Vec3().set(geographic.longitude, geographic.latitude, geographic.height);
    }
    /**
    * 
    * @param {Vec3} v3 
    */
    unproject(v3) {
        return new Geographic(v3.x, v3.y, v3.z);
    }
}
/**
 * @class
 */
class WebMercatorProjection extends Projection {
    /**
     * 
     * @param {*} options 
     */
    constructor(options) {
        super(options);
        /**
         * The maximum latitude (both North and South) supported by a Web Mercator (EPSG:3857) projection.
         */
        this._maximumLatitude = this.mercatorAngleToGeodeticLatitude(Math.PI);
    }
    /**
     * Converts a Mercator angle, in the range -PI to PI, to a geodetic latitude in the range -PI/2 to PI/2.
     * @param {*} mercatorAngle in radius
     */
    mercatorAngleToGeodeticLatitude(mercatorAngle) {
        return Math.PI / 2 - (2.0 * Math.atan(Math.exp(-mercatorAngle)));
    }
    /**
     * Converts a geodetic latitude in radians, in the range -PI/2 to PI/2, to a Mercator angle in the range -PI to PI.
     * @param {*} latitude in radius
     */
    geodeticLatitudeToMercatorAngle(latitude) {
        const MaximumLatitude = this._maximumLatitude;
        if (latitude > MaximumLatitude)
            latitude = MaximumLatitude;
        else if (latitude < -MaximumLatitude)
            latitude = -MaximumLatitude;
        var sinLatitude = Math.sin(latitude);
        return 0.5 * Math.log((1.0 + sinLatitude) / (1.0 - sinLatitude));
    }
    /**
     * @param {Geographic} geographic in radius
     */
    project(geographic) {
        var semimajorAxis = this._semimajorAxis;
        var x = geographic.longitude * semimajorAxis;
        var y = this.geodeticLatitudeToMercatorAngle(geographic.latitude) * semimajorAxis;
        var z = geographic.height;
        return new Vec3().set(x, y, z);
    }
    /**
    * 
    * @param {Vec3} v3 
    */
    unproject(v3) {
        var oneOverEarthSemimajorAxis = this._oneOverSemimajorAxis;
        var longitude = v3.x * oneOverEarthSemimajorAxis;
        var latitude = this.mercatorAngleToGeodeticLatitude(v3.y * oneOverEarthSemimajorAxis);
        var height = v3.z;
        return new Geographic(longitude, latitude, height);
    }
}
/**
 * WebMercator Projection
 */
Projection.WebMercatorProjection = new WebMercatorProjection();

module.exports = Projection;