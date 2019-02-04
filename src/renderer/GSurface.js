
const PI_OVER_TWO = Math.PI / 2,
    requestImage = require('./../utils/requestImage'),
    GTexture = require('./GTexture'),
    QuadtreeTile = require("./../core/QuadtreeTile"),
    GBufferView = require('./../object/GBufferView'),
    GAccessor = require('./../object/GAccessor'),
    WGS84 = require("./../core/Ellipsoid").WGS84,
    equal14 = require("./../utils/revise").equal14,
    BoundingSphere = require("./../core/BoundingSphere"),
    maximumRadius = require("./../core/Ellipsoid").WGS84.maximumRadius,
    { Vec3, Mat4, Vec2 } = require("kiwi.matrix"),
    clamp = require("./../utils/clamp"),
    GUniform = require("./GUniform"),
    GProgram = require("./GProgram"),
    GBuffer = require("./GBuffer");
//
const fragText = require("./../shader/surface_fs.glsl");
const vertText = require("./../shader/surface_vs.glsl");
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
         * @type {Quadtree}
         */
        this._quadtree = quadtree;
        /**
         * @type {Object[]}
         * key-value: key=level-x-y, value:{program,buffer}
         */
        this._tileCaches = [];
        /**
         * listen to quadtree fire events
         */
        this._registerEvents();
    }
    /**
     * 
     */
    _registerEvents() {
        const quadtree = this._quadtree;
        quadtree.on('updatedTiles', this._updateTiles, this);
    }
    /**
     * @param o
     */
    _updateTiles(o) {
        const tileCaches = this._tileCaches,
            { waitRendering } = o;
        //1. request images,len = waitRendering.length
        for (let i = 0, len = waitRendering.length; i < len; i++) {
            const qudatreeTile = waitRendering[i];
            this._request(qudatreeTile);
        }
        //2. calcute vertices and indices , textcoord
        //3. caches program
    }
    /**
     * 
     * @param {*} tile 
     */
    _request(qudatreeTile) {
        const { x, y, level, boundary } = qudatreeTile;
        const gl = this._gl,
            width = 256,
            height = 256,
            tileCache = {},
            tileCaches = this._tileCaches;
        const nw = WGS84.geographicToSpace(boundary.northwest),
            ne = WGS84.geographicToSpace(boundary.northeast),
            sw = WGS84.geographicToSpace(boundary.southwest),
            se = WGS84.geographicToSpace(boundary.southeast);
        //create program
        const gProgram = new GProgram(gl, vertText, fragText);
        //texture = new GTexture(gl, arraybuffer, width, height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.TEXTURE_2D);
        const vertices = [].concat(nw._out).concat(sw._out).concat(se._out).concat(ne._out);
        const indices = [0, 1, 2, 2, 3, 0];
        gProgram.useProgram();
        //1. create vertices buffer
        const vBufferView = new GBufferView(
            gl,
            vertices,
            vertices.length,
            {
                bufferType: gl.ARRAY_BUFFER,
                drawType: gl.STATIC_DRAW,
                byteOffset: 0,
                byteStride: 0
            });
        const vAccessor = new GAccessor(
            gProgram,
            vBufferView,
            gl.FLOAT,
            'VEC3',
            vertices.length / 3,
            {
                byteOffset: 0,
                normalized: false
            });
        vAccessor.bindBuffer();
        vAccessor.bufferData();
        vAccessor.link('a_position');
        //2. create indices buffer
        const iBuffer = new GBuffer(
            gProgram,
            new Uint16Array(indices),
            gl.ELEMENT_ARRAY_BUFFER,
            gl.STATIC_DRAW);
        iBuffer.bindBuffer();
        iBuffer.bufferData();
        //3.uniform
        const uProjection = new GUniform(gProgram, 'u_projectionMatrix'),
            uView = new GUniform(gProgram, 'u_viewMatrix'),
            uModel = new GUniform(gProgram, 'u_modelMatrix');
        //3.create texture image2d
        // texture.texImage2D();
        //4.cache resource
        tileCache.gProgram = gProgram;
        tileCache.vAccessor = vAccessor;
        tileCache.iBuffer = iBuffer;
        tileCache.iLength = indices.length;
        tileCache.uProjection = uProjection;
        tileCache.uView = uView;
        tileCache.uModel = uModel;
        //cache tile
        tileCaches.push(tileCache);
        //level x y
        //https://c.basemaps.cartocdn.com/light_all/
        //openstreet map https://a.tile.openstreetmap.org
        // const baseUri = 'https://c.basemaps.cartocdn.com/light_all/',
        //    uri = baseUri + level + '/' + x + '/' + y + '.png';
        //request image
        // requestImage(uri).then(arraybuffer => {
        //     //1.calcute indics
        //     const gProgram = new GProgram(gl, vertText, fragText);
        //         //texture = new GTexture(gl, arraybuffer, width, height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.TEXTURE_2D);
        //     const vertices = [].concat(nw._out).concat(sw._out).concat(se._out).concat(ne._out);
        //     const indices = [3, 2, 1, 3, 1, 0];
        //     gProgram.useProgram();
        //     //1. create vertices buffer
        //     const vBufferView = new GBufferView(
        //         gl,
        //         vertices,
        //         vertices.length,
        //         {
        //           bufferType: gl.ARRAY_BUFFER,
        //           drawType: gl.STATIC_DRAW,
        //           byteOffset: 0,
        //           byteStride: 0
        //         });
        //     const vAccessor = new GAccessor(
        //         gProgram,
        //         vBufferView,
        //         gl.FLOAT,
        //         'VEC3',
        //         vertices.length/3,
        //         {
        //           byteOffset: 0,
        //           normalized: false
        //         });
        //     vAccessor.bindBuffer();
        //     vAccessor.bufferData();
        //     vAccessor.link('a_position');
        //     //2. create indices buffer
        //     const iBuffer = new GBuffer(
        //         gProgram,
        //         new Uint8Array(indices),
        //         gl.ELEMENT_ARRAY_BUFFER,
        //         gl.STATIC_DRAW);
        //     iBuffer.bindBuffer();
        //     iBuffer.bufferData();
        //     //3.uniform
        //     const uProjection = new GUniform(gProgram, 'u_projectionMatrix'),
        //         uView = new GUniform(gProgram, 'u_viewMatrix'),
        //         uModel = new GUniform(gProgram, 'u_modelMatrix');
        //     //3.create texture image2d
        //     // texture.texImage2D();
        //     //4.cache resource
        //     tileCache.gProgram = gProgram;
        //     // tileCache.texture = texture;
        //     tileCache.vAccessor = vAccessor;
        //     tileCache.iBuffer = iBuffer;
        //     tileCache.iLength = indices.length;
        //     tileCache.uProjection = uProjection;
        //     tileCache.uView = uView;
        //     tileCache.uModel = uModel;
        //     //cache tile
        //     tileCaches.push(tileCache);
        // });
    }
    /**
     * 
     * @param {*} camera 
     */
    render(camera) {
        const gl = this._gl,
            tileCaches = this._tileCaches;
        for (var i = 0, len = tileCaches.length; i < len; i++) {
            const tileCache = tileCaches[i],
                { uProjection,
                    uView,
                    uModel,
                    iLength,
                    gProgram,
                    vAccessor,
                    iBuffer
                } = tileCache;
            gProgram.useProgram();
            //bind vertex buffer
            vAccessor.bindBuffer();
            vAccessor.relink('a_position');
            //bind indices buffer
            iBuffer.bindBuffer();
            //set camera
            uProjection.assignValue(camera.ProjectionMatrix);
            uView.assignValue(camera.ViewMatrix);
            uModel.assignValue(camera.IdentityMatrix);
            //draw polygon
            gl.drawElements(gl.TRIANGLES, iLength, gl.UNSIGNED_SHORT, 0);
        }
    }
}

module.exports = GSurface;
