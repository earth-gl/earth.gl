
const glslify = require("glslify"),
    isNode = require("./../utils/isNode"),
    BoundingSphere = require("./../core/BoundingSphere"),
    { createTypedArrayFromArrayBuffer , getStringFromTypedArray} = require("./../utils/typedArray"),
    { Vec3 } = require("kiwi.matrix"),
    GUniform = require("./GUniform"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer"),
    { fetchArrayBuffer } = require("./../utils/resource");
const storedToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZjI5MmJlNS01YWJhLTQzMWYtODM1NS0xMDFmMGQyOGEwNDMiLCJpZCI6NjYwMSwiYXNzZXRzIjp7IjEiOnsidHlwZSI6IlRFUlJBSU4iLCJleHRlbnNpb25zIjpbdHJ1ZSx0cnVlLHRydWVdLCJwdWxsQXBhcnRUZXJyYWluIjp0cnVlfX0sInNyYyI6IjZjYjk4MzM2LTJiYzEtNDVhZC04MWU0LWVmMjc4YTI0MGY1OSIsImlhdCI6MTU0NzU2MDUzNiwiZXhwIjoxNTQ3NTY0MTM2fQ.ieiDS7Swb_w3UisRLfXdRuRExnzUNtKBh3UUY6BOFlc",
    storedUrl = "https://assets.cesium.com/1/2/7/1.terrain",
    //storedUrl = "https://assets.cesium.com/{assertId}/{z}/{x}/{y}.terrain",
    storedHeader = {
        Accept: "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*"
    };
const QuantizedMeshExtensionIds = {
    /**
     * Oct-Encoded Per-Vertex Normals are included as an extension to the tile mesh
     *
     * @type {Number}
     * @constant
     * @default 1
     */
    OCT_VERTEX_NORMALS: 1,
    /**
     * A watermask is included as an extension to the tile mesh
     *
     * @type {Number}
     * @constant
     * @default 2
     */
    WATER_MASK: 2,
    /**
     * A json object contain metadata about the tile
     *
     * @type {Number}
     * @constant
     * @default 4
     */
    METADATA: 4
};
/**
 * glsl
 */
const fragText = isNode ? glslify.file("./../shader/glsl-earth-gl-terrain-fs.glsl") : require("./../shader/glsl-earth-gl-terrain-fs.glsl");
const vertText = isNode ? glslify.file("./../shader/glsl-earth-gl-terrain-vs.glsl") : require("./../shader/glsl-earth-gl-terrain-vs.glsl");
/**
 * request terrain data for cesium server
 * @class
 */
class GSurface {
    /**
     * @typedef {import("./../core/Quadtree")} Quadtree
     * @param {Quadtree} quadtree 
     */
    constructor(gl, quadtree) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = gl;
        /**
         * @type Quadtree
         */
        this._quadtree = quadtree;
        /**
         * @type {Object[]}
         * key-value: key=level-x-y, value:{program,buffer}
         */
        this._surfaces = [];
    }
    /**
     * 
     * @param {*} tile 
     */
    _request(tile) {
        const that = this,
            surfaces = this._surfaces,
            url = storedUrl,
            token = storedToken,
            header = storedHeader;
        fetchArrayBuffer(url, header, token).then(function (buffer) {
            var pos = 0;
            var cartesian3Elements = 3;
            var boundingSphereElements = cartesian3Elements + 1;
            var cartesian3Length = Float64Array.BYTES_PER_ELEMENT * cartesian3Elements;
            var boundingSphereLength = Float64Array.BYTES_PER_ELEMENT * boundingSphereElements;
            var encodedVertexElements = 3;
            var encodedVertexLength = Uint16Array.BYTES_PER_ELEMENT * encodedVertexElements;
            var triangleElements = 3;
            var bytesPerIndex = Uint16Array.BYTES_PER_ELEMENT;
            var triangleLength = bytesPerIndex * triangleElements;

            var view = new DataView(buffer);
            var center = new Vec3().set(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
            pos += cartesian3Length;

            var minimumHeight = view.getFloat32(pos, true);
            pos += Float32Array.BYTES_PER_ELEMENT;
            var maximumHeight = view.getFloat32(pos, true);
            pos += Float32Array.BYTES_PER_ELEMENT;

            var boundingSphere = new BoundingSphere(
                new Vec3().set(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true)),
                view.getFloat64(pos + cartesian3Length, true));
            pos += boundingSphereLength;

            var horizonOcclusionPoint = new Vec3().set(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
            pos += cartesian3Length;

            var vertexCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var encodedVertexBuffer = new Uint16Array(buffer, pos, vertexCount * 3);
            pos += vertexCount * encodedVertexLength;

            if (vertexCount > 64 * 1024) {
                // More than 64k vertices, so indices are 32-bit.
                bytesPerIndex = Uint32Array.BYTES_PER_ELEMENT;
                triangleLength = bytesPerIndex * triangleElements;
            }

            // Decode the vertex buffer.
            var uBuffer = encodedVertexBuffer.subarray(0, vertexCount);
            var vBuffer = encodedVertexBuffer.subarray(vertexCount, 2 * vertexCount);
            var heightBuffer = encodedVertexBuffer.subarray(vertexCount * 2, 3 * vertexCount);

            AttributeCompression.zigZagDeltaDecode(uBuffer, vBuffer, heightBuffer);

            // skip over any additional padding that was added for 2/4 byte alignment
            if (pos % bytesPerIndex !== 0) {
                pos += (bytesPerIndex - (pos % bytesPerIndex));
            }

            var triangleCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var indices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, triangleCount * triangleElements);
            pos += triangleCount * triangleLength;

            // High water mark decoding based on decompressIndices_ in webgl-loader's loader.js.
            // https://code.google.com/p/webgl-loader/source/browse/trunk/samples/loader.js?r=99#55
            // Copyright 2012 Google Inc., Apache 2.0 license.
            var highest = 0;
            var length = indices.length;
            for (var i = 0; i < length; ++i) {
                var code = indices[i];
                indices[i] = highest - code;
                if (code === 0) {
                    ++highest;
                }
            }

            var westVertexCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var westIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, westVertexCount);
            pos += westVertexCount * bytesPerIndex;

            var southVertexCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var southIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, southVertexCount);
            pos += southVertexCount * bytesPerIndex;

            var eastVertexCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var eastIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, eastVertexCount);
            pos += eastVertexCount * bytesPerIndex;

            var northVertexCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var northIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, northVertexCount);
            pos += northVertexCount * bytesPerIndex;

            var encodedNormalBuffer;
            var waterMaskBuffer;
            while (pos < view.byteLength) {
                var extensionId = view.getUint8(pos, true);
                pos += Uint8Array.BYTES_PER_ELEMENT;
                var extensionLength = view.getUint32(pos, littleEndianExtensionSize);
                pos += Uint32Array.BYTES_PER_ELEMENT;

                if (extensionId === QuantizedMeshExtensionIds.OCT_VERTEX_NORMALS && provider._requestVertexNormals) {
                    encodedNormalBuffer = new Uint8Array(buffer, pos, vertexCount * 2);
                } else if (extensionId === QuantizedMeshExtensionIds.WATER_MASK && provider._requestWaterMask) {
                    waterMaskBuffer = new Uint8Array(buffer, pos, extensionLength);
                } else if (extensionId === QuantizedMeshExtensionIds.METADATA && provider._requestMetadata) {
                    var stringLength = view.getUint32(pos, true);
                    if (stringLength > 0) {
                        var jsonString = getStringFromTypedArray(new Uint8Array(buffer), pos + Uint32Array.BYTES_PER_ELEMENT, stringLength);
                        var metadata = JSON.parse(jsonString);
                        var availableTiles = metadata.available;
                        if (defined(availableTiles)) {
                            for (var offset = 0; offset < availableTiles.length; ++offset) {
                                var availableLevel = level + offset + 1;
                                var rangesAtLevel = availableTiles[offset];
                                var yTiles = provider._tilingScheme.getNumberOfYTilesAtLevel(availableLevel);
                                for (var rangeIndex = 0; rangeIndex < rangesAtLevel.length; ++rangeIndex) {
                                    var range = rangesAtLevel[rangeIndex];
                                    var yStart = yTiles - range.endY - 1;
                                    var yEnd = yTiles - range.startY - 1;
                                    provider.availability.addAvailableTileRange(availableLevel, range.startX, yStart, range.endX, yEnd);
                                    layer.availability.addAvailableTileRange(availableLevel, range.startX, yStart, range.endX, yEnd);
                                }
                            }
                        }
                    }
                    layer.availabilityTilesLoaded.addAvailableTileRange(level, x, y, x, y);
                }
                pos += extensionLength;
            }
            //
            var s ={
                center: center,
                minimumHeight: minimumHeight,
                maximumHeight: maximumHeight,
                quantizedVertices: encodedVertexBuffer,
                encodedNormals: encodedNormalBuffer,
                indices: indices,
                westIndices: westIndices,
                southIndices: southIndices,
                eastIndices: eastIndices,
                northIndices: northIndices,
                waterMask: waterMaskBuffer,
            };
            //Uint8Array,Int8Array,Int16Array
            //const vertices = new Int16Array(buffer);
            //const normals = new Int8Array(buffer);
            //const indices = new Uint8Array(buffer);
            //const surfaceElement = that._createSufraceElement.call(that, vertices, indices);
            //surfaces.push(surfaceElement);
        }, function (err) {

        });
    }
    /**
     * 
     * @param {Float32Array} vertices 
     * @param {Unit8Array} indices 
     */
    _createSufraceElement(vertices, indices) {
        //
        const processVertices = [];
        for (var i = 0, len = vertices.length; i < len; i++)
            processVertices[i] = vertices[i] * 100.0;
        //
        const lengthOfIndices = indices.length;
        const gl = this._gl;
        const program = new GProgram(gl, vertText, fragText);
        program.useProgram();
        //
        const verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
        // transform data
        verticesBuffer.bindBuffer();
        verticesBuffer.bufferData(new Float32Array(processVertices));
        verticesBuffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);
        // transform index data
        const indicesBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        indicesBuffer.bindBuffer();
        indicesBuffer.bufferData(indices);
        //
        const u_projectionMatrix = new GUniform(program, "u_projectionMatrix"),
            u_viewMatrix = new GUniform(program, "u_viewMatrix"),
            u_modelMatrix = new GUniform(program, "u_modelMatrix");
        //
        return {
            program,
            indicesBuffer,
            verticesBuffer,
            u_projectionMatrix,
            u_viewMatrix,
            u_modelMatrix,
            lengthOfIndices,
        }
    }
    /**
     * 
     * @param {*} camera 
     */
    render(camera) {
        const gl = this._gl;
        for (var i = 0, len = this._surfaces.length; i < len; i++) {
            const surface = this._surfaces[i],
                { u_projectionMatrix, u_viewMatrix, u_modelMatrix, program, verticesBuffer, indicesBuffer, lengthOfIndices } = surface;
            program.useProgram();
            verticesBuffer.bindBuffer();
            indicesBuffer.bindBuffer();
            //set camera
            u_projectionMatrix.assignValue(camera.ProjectionMatrix);
            u_viewMatrix.assignValue(camera.ViewMatrix);
            u_modelMatrix.assignValue(camera.IdentityMatrix);
            //gl draw
            gl.drawElements(gl.TRIANGLES, lengthOfIndices, gl.UNSIGNED_SHORT, 0);
        }
    }
    /**
     * 
     */
    update() {
        this._request();
        //1. culling volume
        //2. wait rendering tile collection
        //3. combine arrybuffer
    }
}

module.exports = GSurface;

