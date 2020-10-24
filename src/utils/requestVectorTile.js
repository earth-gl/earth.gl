const Pbf = require('pbf'),
    { VectorTile } = require('@mapbox/vector-tile');

/**
 * @function
 * @param {string} url 
 * @returns {VectorTile}
 */
const requestVectorTile = function (uri) {
    return new Promise((resolve, reject) => {
        fetch(uri, {
            responseType: 'arraybuffer'
        }).then(response => {
            return response.arrayBuffer();
        }).then(buffer => {
            const pbf = new Pbf(buffer);
            const vt = new VectorTile(pbf);
            resolve(vt);
        }, reason => {
            reject(reason);
        });
    });
};

module.exports = requestVectorTile;