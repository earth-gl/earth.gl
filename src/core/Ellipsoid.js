/**
 *
 */
const Vec3 = require('kiwi.matrix').Vec3,
    { PHYSICAL_CONSTANT } = require('./../utils/util'),
    createTypedArray = require("./../utils/createTypedArray");
/**
 * 
 */
const cos = Math.cos,
    sin = Math.sin;
/**
 * @class
 */
class Ellipsoid {
    /**
     *
     * @param {Number} x The radius in the x direction.
     * @param {Number} y The radius in the y direction.
     * @param {Number} z The radius in the z direction.
     */
    constructor(x, y, z) {
        /**
         * @type {Vec3}
         */
        this._radii = new Vec3().set(x, y, z);
        /**
         * @type {Vec3}  x2    y2  z2
         */
        this._radiiSquared = new Vec3().set(x * x, y * y, z * z);
        /**
         * @type {Vec3}  1/x  1/y  1/z
         */
        this._oneOverRadii = new Vec3().set(1.0 / x, 1.0 / y, 1.0 / z);
    }

    get Radii() {
        return this._radii;
    }

    toGerometry() {
        var latitudeBands = 64;
        var longitudeBands = 64;
        var radius = 6356753;
        var vertexPositionData = [];
        var colors = [];
        var indexData = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
    
            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
    
                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
    
                colors = [[1.0, 1.0, 0.3, 1.0]];
                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
    
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);
    
                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }
    
        var unpackedColors = [];
        for (var i in colors) {
            var color = colors[i];
            for (var j=0; j < 4; j++) {
                unpackedColors = unpackedColors.concat(color);
            }
        }

        return {vertexPositionData,indexData};
    
    }
}

Ellipsoid.WGS84 = new Ellipsoid(
    PHYSICAL_CONSTANT.EARTH_RADIUS_X,
    PHYSICAL_CONSTANT.EARTH_RADIUS_Y,
    PHYSICAL_CONSTANT.EARTH_RADIUS_Z);

module.exports = Ellipsoid;