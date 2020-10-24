/**
 * example pbf
 * http://127.0.0.1:1338/mbtiles/12/2532/2885
 */

const requestVectorTile = require('./../utils/requestVectorTile');

class VectorTileLayer {

    constructor(){

    }

    createTile(){
        const vectorTilePromise = requestVectorTile(uri);
    }

}