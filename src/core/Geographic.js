const GLMatrix = require("kiwi.matrix").GLMatrix;
/**
 * represent position in geographic coordinate system
 * @class
 */
class Geographic{
    /**
     * 
     * @param {Number} lng ,represent in radians
     * @param {Number} lat ,represent in radians
     * @param {Number} h ,represent in meters
     * @param {Boolean} parseRadian , defale false, parse lat ,lng value to degree
     */
    constructor(lng,lat,h, parseRadian = false){
        this._lng = parseRadian?GLMatrix.toDegree(lng):lng;
        this._lat = parseRadian?GLMatrix.toDegree(lat):lat;
        this._h = h;
    }
    /**
     * @type {Number} the latitide value in degree
     */
    get latitude(){
        return this._lat;
    }
    /**
     * @type {Number} the longitude value in degree
     */
    get longitude(){
        return this._lng;
    }
    /**
     * @type {Number} the height value 
     */
    get height(){
        return this._h;
    }
}

module.exports = Geographic;