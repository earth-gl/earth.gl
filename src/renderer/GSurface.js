
const PI_OVER_TWO = Math.PI / 2,
    requestImage = require('./../utils/requestImage'),
    GTexture = require('./GTexture'),
    Geographic = require('./../core/Geographic'),
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
        this._tileCaches = {};
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
    }
    /**
     * interpolation
     */
    _lerp(boundary) {
        const lerp = 5,
            lerpFactor = 1 / lerp,
            rangeX = boundary.width,
            rangeY = boundary.height,
            northwest = boundary.northwest;
        let vertices = [],
            indices = [];
        for (let x = 1; x <= lerp; x++)
            for (let y = 1; y <= lerp; y++) {
                const x0 = x - 1,
                    y0 = y - 1,
                    g1 = new Geographic(
                        northwest.longitude + x0 * lerpFactor * rangeX,
                        northwest.latitude - y0 * lerpFactor * rangeY,
                        0),
                    g2 = new Geographic(
                        northwest.longitude + x0 * lerpFactor * rangeX,
                        northwest.latitude - y0 * lerpFactor * rangeY - y * lerpFactor * rangeY,
                        0),
                    g3 = new Geographic(
                        northwest.longitude + x0 * lerpFactor * rangeX + x * lerpFactor * rangeX,
                        northwest.latitude - y0 * lerpFactor * rangeY - y * lerpFactor * rangeY,
                        0),
                    g4 = new Geographic(
                        northwest.longitude + x0 * lerpFactor * rangeX + x * lerpFactor * rangeX,
                        northwest.latitude - y0 * lerpFactor * rangeY,
                        0);
                const s1 = WGS84.geographicToSpace(g1),
                    s2 = WGS84.geographicToSpace(g2),
                    s3 = WGS84.geographicToSpace(g3),
                    s4 = WGS84.geographicToSpace(g4);
                //let
                vertices = vertices.concat(s1._out).concat(s2._out).concat(s3._out).concat(s4._out)
                const index = x0 * lerp + y0;
                indices.push(index + 3);
                indices.push(index + 2);
                indices.push(index + 1);
                indices.push(index + 3);
                indices.push(index + 1);
                indices.push(index);
            }
        return { vertices, indices };
    }
    /**
     * 
     * @param {*} tile 
     */
    _request(qudatreeTile) {
        const { x, y, level, boundary } = qudatreeTile;
        const gl = this._gl,
            key = x + '-' + y + '-' + level,
            width = 256,
            height = 256,
            tileCaches = this._tileCaches;
        //check tile Cached
        if (tileCaches[key]) return;
        //create program
        const tileCache = {},
            gProgram = new GProgram(gl, vertText, fragText);
        //texture = new GTexture(gl, arraybuffer, width, height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.TEXTURE_2D);
        const { vertices, indices } = this._lerp(boundary);
        //const vertices = [].concat(nw._out).concat(sw._out).concat(se._out).concat(ne._out);
        //const indices = [0, 1, 2, 2, 3, 0];
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
        tileCaches[key] = tileCache;
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
        for (const key in tileCaches) {
            const tileCache = tileCaches[key],
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
