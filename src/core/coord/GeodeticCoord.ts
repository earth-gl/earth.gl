/**
 * represent position in geographic coordinate system
 * 
 *          Z                                          
 *          |                                          
 *          |                                          
 *          |                                          
 *          |__ __ __ __ __ Y      
 *         / o                                        
 *        /                                          
 *       /                                         
 *      /                                          
 *      X                                         
 * 
 * @class
 */
class GeodeticCoord {
    /**
     * represent in meters
     */
    private _h:number;
    /**
     * represent in radians
     */
    private _lat:number;
    /**
     * represent in radians
     */
    private _lng:number;
    /**
     * 
     * @param lng in degree
     * @param lat in degree
     * @param h in meters
     */
    constructor(lng:number, lat:number, h:number = 0.0) {
        this._lng = lng;
        this._lat = lat;
        this._h = h;
    }
    /**
     * @type {Number} the latitide value in degree
     */
    get latitude() {
        return this._lat;
    }
    /**
     * @type {Number} the longitude value in degree
     */
    get longitude() {
        return this._lng;
    }
    /**
     * @type {Number} the height value 
     */
    get height() {
        return this._h;
    }
}

export { GeodeticCoord }