
const { Vec3, Mat3, Mat4 } = require("kiwi.matrix"),
    clamp= require("../src/utils/clamp");

const TerrainQuantization = {
    /**
     * the vretices are not compressed
     */
    NONE: 0,
    /**
     * the vertices are compressed to 12 bits
     */
    BITS12: 1
}

const SHIFT_LEFT_12 = Math.pow(2.0, 12.0);

class TerrainEncoding {
    /**
     * 
     * @param {Vec3} minimum 
     * @param {*} maximum 
     * @param {*} center 
     * @param {*} hMin 
     * @param {*} maximumHeight 
     * @param {Mat4} fromENU 
     * @param {*} hasVertexNormals 
     * @param {*} hasWebMercatorT 
     */
    constructor(minimum, maximum, center, hMin, maximumHeight, fromENU, hasVertexNormals, hasWebMercatorT) {
       
        var dimensions = maximum.clone().sub(minimum);
        var hDim = maximumHeight - minimumHeight;
        var maxDim = Math.max(Math.max(dimensions.x, dimensions.y, dimensions.z), hDim)
        var quantization = maxDim < SHIFT_LEFT_12 - 1.0 ? TerrainQuantization.BITS12 : TerrainQuantization.NONE;
        var toENU = fromENU.clone().inverseTransformation();
        var translation = minimum.negate();
        toENU = Mat4.fromMat3Translation(new Mat3().identity(),translation).multiply(toENU);
        var scale = new Vec3().set(1.0/dimensions.x,1.0/dimensions.y,1.0/dimension.z);
        toENU = Mat4.fromScaling(scale).multiply(toENU);
        var matrix = fromENU.clone();
        matrix.setTranslation(new Vec3());
        var translationMatrix  = Mat4.fromVec3Translation(minimum);
        var scaleMatrix  = Mat4.fromScaling(dimensions);
        var st = translationMatrix.multiply(scaleMatrix);
        fromENU.multiply(st);
        matrix.multiply(st);
        //
        this.quantization = quantization;
        this.minimumHeight = minimumHeight ;
        this.maximumHeight  = maximumHeight ;
        this.center = center ;
        this.toScaledENU =toENU;
        this.fromScaledENU = fromENU;
        this.matrix = matrix;
        this.hasVertexNormals = hasVertexNormals;
        this.hasWebMercatorT = hasWebMercatorT;

    }

    encode(vertexBuffer, bufferIndex, position, uv, height, normalToPack, webMercatorT){
        var u = uv.x;
        var v = uv.y;

        if (this.quantization === TerrainQuantization.BITS12) {
            position =this.toScaledENU.clone().multiplyByVec3(position);

            position.x = clamp(position.x, 0.0, 1.0);
            position.y = clamp(position.y, 0.0, 1.0);
            position.z = clamp(position.z, 0.0, 1.0);

            var hDim = this.maximumHeight - this.minimumHeight;
            var h = clamp((height - this.minimumHeight) / hDim, 0.0, 1.0);

            Cartesian2.fromElements(position.x, position.y, cartesian2Scratch);
            var compressed0 = AttributeCompression.compressTextureCoordinates(cartesian2Scratch);

            Cartesian2.fromElements(position.z, h, cartesian2Scratch);
            var compressed1 = AttributeCompression.compressTextureCoordinates(cartesian2Scratch);

            Cartesian2.fromElements(u, v, cartesian2Scratch);
            var compressed2 = AttributeCompression.compressTextureCoordinates(cartesian2Scratch);

            vertexBuffer[bufferIndex++] = compressed0;
            vertexBuffer[bufferIndex++] = compressed1;
            vertexBuffer[bufferIndex++] = compressed2;

            if (this.hasWebMercatorT) {
                Cartesian2.fromElements(webMercatorT, 0.0, cartesian2Scratch);
                var compressed3 = AttributeCompression.compressTextureCoordinates(cartesian2Scratch);
                vertexBuffer[bufferIndex++] = compressed3;
            }
        } else {
            Cartesian3.subtract(position, this.center, cartesian3Scratch);

            vertexBuffer[bufferIndex++] = cartesian3Scratch.x;
            vertexBuffer[bufferIndex++] = cartesian3Scratch.y;
            vertexBuffer[bufferIndex++] = cartesian3Scratch.z;
            vertexBuffer[bufferIndex++] = height;
            vertexBuffer[bufferIndex++] = u;
            vertexBuffer[bufferIndex++] = v;

            if (this.hasWebMercatorT) {
                vertexBuffer[bufferIndex++] = webMercatorT;
            }
        }

        if (this.hasVertexNormals) {
            vertexBuffer[bufferIndex++] = AttributeCompression.octPackFloat(normalToPack);
        }

        return bufferIndex;
    }

}

module.exports = TerrainEncoding;