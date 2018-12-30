/**
 * Takes an object containing keys and values and returns an object
 * comprising two "associate" arrays, one with the keys and the other
 * with the values.
 * 
 * @param {*} obj 
 */
const keyValuesToArrays = function(o){
    var keysArray = [], valuesArray = [];
    var i = 0;
    for(var key in o) {
        if (o.hasOwnProperty(key)) {
            keysArray[i] = key;
            valuesArray[i] = o[key];
            i++;
        }
    }
    return {
        keys: keysArray,
        values: valuesArray
    };
};

module.exports = keyValuesToArrays;