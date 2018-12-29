/**
 * reference:
 * https://github.com/playcanvas/engine/blob/master/src/core/guid.js
 * @description Basically a very large random number (128-bit) which means the probability of creating two that clash is vanishingly small.
 * GUIDs are used as the unique identifiers for Entities.
 */
const guid = function(){
    var str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = (c == 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return str;
}

module.exports = guid;