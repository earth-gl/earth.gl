
const glslify = require("glslify"),
    isNode = require("./../utils/isNode"),
    { fetchArrayBuffer } = require("./../utils/resource");
const storedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDBiNjk2Zi1lNDljLTRjZTQtYjg2Ny0yMTAzMjdmNDE3MWQiLCJpZCI6NjYwMSwiYXNzZXRzIjp7IjEiOnsidHlwZSI6IlRFUlJBSU4iLCJleHRlbnNpb25zIjpbdHJ1ZSx0cnVlLHRydWVdLCJwdWxsQXBhcnRUZXJyYWluIjp0cnVlfX0sInNyYyI6IjZjYjk4MzM2LTJiYzEtNDVhZC04MWU0LWVmMjc4YTI0MGY1OSIsImlhdCI6MTU0NzAxODUxMywiZXhwIjoxNTQ3MDIyMTEzfQ.Vu6WIIziod4RvBGGKp_oBCbX4jND3KTr_ECW5W71yEQ",
    storedUrl = "https://assets.cesium.com/1/9/789/370.terrain",
    //storedUrl = "https://assets.cesium.com/{assertId}/{z}/{x}/{y}.terrain",
    storedHeader = {
        Accept: "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01,*/*"
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
        fetchArrayBuffer(url, header, token).then(function (msg) {
            var buffer = new ArrayBuffer(msg.length);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < msg.length; i++) {
                view[i] = msg.charCodeAt(i);
            }
            const vertices = buffer[0];
            const indices = buffer[2];
            const surfaceElement = that._createSufraceElement.call(that, vertices, indices);
            surfaces.push(surfaceElement);
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
        const gl = this._gl;
        const program = new GProgram(gl, vertText, fragText);
        program.useProgram();
        //
        const verticesBuffer = new GBuffer(program, gl.ARRAY_BUFFER, gl.STATIC_DRAW, "a_position");
        // transform data
        verticesBuffer.bindBuffer();
        verticesBuffer.bufferData(vertices);
        verticesBuffer.linkPointerAndPosition(3, gl.FLOAT, false, 0, 0);
        // transform index data
        const indexBuffer = new GBuffer(program, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        indexBuffer.bindBuffer();
        indexBuffer.bufferData(indices);
        //
        u_projectionMatrix = new GUniform(program, "u_projectionMatrix");
        u_viewMatrix = new GUniform(program, "u_viewMatrix");
        u_modelMatrix = new GUniform(program, "u_modelMatrix");
        //
        return {
            program: program,
            indicesBuffer: indexBuffer,
            verticesBuffer: verticesBuffer,
            u_projectionMatrix: u_projectionMatrix,
            u_viewMatrix: u_viewMatrix,
            u_modelMatrix: u_modelMatrix
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
                { u_projectionMatrix,
                    u_viewMatrix,
                    u_modelMatrix,
                    program,
                    verticesBuffer,
                    indicesBuffer } = surface;
            program.useProgram();
            verticesBuffer.bindBuffer();
            indicesBuffer.bindBuffer();
            //set camera
            u_projectionMatrix.assignValue(camera.ProjectionMatrix);
            u_viewMatrix.assignValue(camera.ViewMatrix);
            u_modelMatrix.assignValue(camera.IdentityMatrix);
            gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
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

