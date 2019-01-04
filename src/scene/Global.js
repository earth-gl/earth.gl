
const {PHYSICAL_CONSTANT} = require("./../utils/util");
/**
 * 绘制全球
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Scene/Globe.js
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Core/Ellipsoid.js
 */
class Global {

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    constructor() {
        /**
         * 
         */
        this._radiusX = PHYSICAL_CONSTANT.EARTH_RADIUS_X;
        /**
         * 
         */
        this._radiusY = PHYSICAL_CONSTANT.EARTH_RADIUS_Y;
        /**
         * 
         */
        this._radiusZ = PHYSICAL_CONSTANT.EARTH_RADIUS_Z;
        /**
         * 
         */
        this._vertices = [];
        /**
         * 
         */
        this._indexs=[];
        /**
         * build geometry and get vertics and indeics
         */
        this._geometry();
    }

    _geometry() {
        const latitudeBands = 64,
            longitudeBands = 64,
            radiusX = this._radiusX,
            radiusY=this._radiusY,
            radiusZ = this._radiusZ,
            vertexPositionData = [],
            indexData = [];

        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                // colors = [[1.0, 1.0, 0.3, 1.0]];
                vertexPositionData.push(radiusX * x);
                vertexPositionData.push(radiusY * y);
                vertexPositionData.push(radiusZ * z);
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
        this._vertices = vertexPositionData;
        this._indexs = indexData;
    }
}

module.exports = Global;