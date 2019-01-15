/**
 * request terrain data for cesium server
 * @class
 */
class GSurface{
    /**
     * @typedef {import("./../core/Quadtree")} Quadtree
     * @param {Quadtree} quadtree 
     */
    constructor(quadtree){
        /**
         * @type Quadtree
         */
        this._quadtree = quadtree;
    }

    update(){
        //1. culling volume
        //2. wait rendering tile collection
        //3. combine arrybuffer
    }
}

module.exports = GSurface;

