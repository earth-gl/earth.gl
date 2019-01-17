
const glslify = require("glslify"),
    isNode = require("./../utils/isNode"),
    BoundingSphere = require("./../core/BoundingSphere"),
    { createTypedArrayFromArrayBuffer, getStringFromTypedArray } = require("./../utils/typedArray"),
    { Vec3 } = require("kiwi.matrix"),
    decode = require("./../utils/decode"),
    GUniform = require("./GUniform"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer"),
    maximumRadius = require("./../core/Ellipsoid").WGS84.maximumRadius,
    { fetchArrayBuffer } = require("./../utils/resource");

const fetch = require('node-fetch');
    

//const url = "https://assets.cesium.com/1/4/22/10.terrain?extensions=octvertexnormals-watermask&v=1.1.0";
const url = "https://assets.cesium.com/1/0/0/0.terrain?v=1.1.0";
//const  url = "http://139.129.7.130/terrain/0.terrain";

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
            surfaces = this._surfaces;
        fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*;access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMWUzZmM0Ny1jM2U0LTQ5NDYtOGZmOS00ZTkzNjcwODIyZDkiLCJpZCI6NjYwMSwiYXNzZXRzIjp7IjEiOnsidHlwZSI6IlRFUlJBSU4iLCJleHRlbnNpb25zIjpbdHJ1ZSx0cnVlLHRydWVdLCJwdWxsQXBhcnRUZXJyYWluIjp0cnVlfX0sInNyYyI6IjZjYjk4MzM2LTJiYzEtNDVhZC04MWU0LWVmMjc4YTI0MGY1OSIsImlhdCI6MTU0NzczNzg4MCwiZXhwIjoxNTQ3NzQxNDgwfQ.4ze1qGzDe0m5Yht4lFRS6MTYUBEYUtx-gqScsWrrBg0",
            },
            responseType: "arraybuffer",
        }).then(function (res) {
            return res.arrayBuffer();
        }).then(function (buffer) {
            const rawMesh = decode(buffer);
            //https://github.com/AnalyticalGraphicsInc/cesium/blob/22dce1d9aaf480b0cbea6148b05a4c482ce80f00/Source/Workers/createVerticesFromQuantizedTerrainMesh.js#L48
            const vertexCount = rawMesh.vertexData.length/3
                +rawMesh.westIndices.length
                +rawMesh.southIndices.length
                +rawMesh.eastIndices.length
                +rawMesh.northIndices.length;
            var indices = createTypedArrayFromArrayBuffer(vertexCount,rawMesh.triangleIndices);
            var vertices = new Float32Array(rawMesh.vertexData);
            //
            const surfaceElement = that._createSufraceElement.call(that,vertices, indices);
            surfaces.push(surfaceElement);
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
        const processIndices = indices;
        const lengthOfIndices = processIndices.length;
        const gl = this._gl;
        const program = new GProgram(gl, vertText, fragText);
        program.useProgram();
        //
        const verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
        // transform data
        verticesBuffer.bindBuffer();
        verticesBuffer.bufferData(new Float32Array(vertices));
        verticesBuffer.linkAndEnableAttribPointer(3, gl.FLOAT, false, 0, 0);
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
        };
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
            verticesBuffer.linkAndEnableAttribPointer(3, gl.FLOAT, false, 0, 0);
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

