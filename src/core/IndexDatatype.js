 
    const IndexDatatype = {
        /**
         * 8-bit unsigned byte corresponding to <code>UNSIGNED_BYTE</code> and the type
         * of an element in <code>Uint8Array</code>.
         *
         * @type {Number}
         * @constant
         */
        UNSIGNED_BYTE : WebGLConstants.UNSIGNED_BYTE,

        /**
         * 16-bit unsigned short corresponding to <code>UNSIGNED_SHORT</code> and the type
         * of an element in <code>Uint16Array</code>.
         *
         * @type {Number}
         * @constant
         */
        UNSIGNED_SHORT : WebGLConstants.UNSIGNED_SHORT,

        /**
         * 32-bit unsigned int corresponding to <code>UNSIGNED_INT</code> and the type
         * of an element in <code>Uint32Array</code>.
         *
         * @type {Number}
         * @constant
         */
        UNSIGNED_INT : WebGLConstants.UNSIGNED_INT
    };

    /**
     * Returns the size, in bytes, of the corresponding datatype.
     *
     * @param {IndexDatatype} indexDatatype The index datatype to get the size of.
     * @returns {Number} The size in bytes.
     *
     * @example
     * // Returns 2
     * var size = Cesium.IndexDatatype.getSizeInBytes(Cesium.IndexDatatype.UNSIGNED_SHORT);
     */
    IndexDatatype.getSizeInBytes = function(indexDatatype) {
        switch(indexDatatype) {
            case IndexDatatype.UNSIGNED_BYTE:
                return Uint8Array.BYTES_PER_ELEMENT;
            case IndexDatatype.UNSIGNED_SHORT:
                return Uint16Array.BYTES_PER_ELEMENT;
            case IndexDatatype.UNSIGNED_INT:
                return Uint32Array.BYTES_PER_ELEMENT;
        }
    };

    IndexDatatype.validate = function(indexDatatype) {
        return defined(indexDatatype) &&
               (indexDatatype === IndexDatatype.UNSIGNED_BYTE ||
                indexDatatype === IndexDatatype.UNSIGNED_SHORT ||
                indexDatatype === IndexDatatype.UNSIGNED_INT);
    };

    IndexDatatype.createTypedArray = function(numberOfVertices, indicesLengthOrArray) {
        if (numberOfVertices >= CesiumMath.SIXTY_FOUR_KILOBYTES) {
            return new Uint32Array(indicesLengthOrArray);
        }
        return new Uint16Array(indicesLengthOrArray);
    };

    IndexDatatype.createTypedArrayFromArrayBuffer = function(numberOfVertices, sourceArray, byteOffset, length) {
        if (numberOfVertices >= CesiumMath.SIXTY_FOUR_KILOBYTES) {
            return new Uint32Array(sourceArray, byteOffset, length);
        }
        return new Uint16Array(sourceArray, byteOffset, length);
    };

    return freezeObject(IndexDatatype);