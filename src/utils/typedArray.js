/**
 * Uint16Array length limits
 */
const SIXTY_FOUR_KILOBYTES = 64 * 1024;

const createTypedArray = function (numberOfVertices, indicesLengthOrArray) {
    if (numberOfVertices > SIXTY_FOUR_KILOBYTES)
        return new Uint32Array(indicesLengthOrArray);
    else
        return new Uint16Array(indicesLengthOrArray);
};

module.exports = {
    createTypedArray
};