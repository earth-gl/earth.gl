
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
            rangeX = boundary.width
        rangeY = boundary.height;
        const start = boundary.southwest;
        let texcoords = [],
            vertices = [],
            indices = [];
        for (let x = 0; x <= lerp; x++)
            for (let y = 0; y <= lerp; y++) {
                const g1 = new Geographic(
                    start.longitude + x * lerpFactor * rangeX,
                    start.latitude + y * lerpFactor * rangeY,
                    0);
                //convert to space coord
                const spaceCoord = WGS84.geographicToSpace(g1);
                //push vertices
                vertices = vertices.concat(spaceCoord._out);
                //texcoords
                texcoords = texcoords.concat([x * lerpFactor, y * lerpFactor]);
            }
        for (let x = 0; x < lerp; ++x)
            for (let y = 0; y < lerp; ++y) {
                let first = (x * (lerp + 1)) + y;
                let second = first + lerp + 1;
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);
                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        //retrun vertices array and indices array
        return { vertices, indices, texcoords };
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
        //level x y
        //https://c.basemaps.cartocdn.com/light_all/
        //openstreet map https://a.tile.openstreetmap.org
        const baseUri = 'https://c.basemaps.cartocdn.com/light_all/',
            uri = baseUri + level + '/' + x + '/' + y + '.png';
        //request image
        requestImage(uri).then(arraybuffer => {
            //create program
            const tileCache = {},
                gProgram = new GProgram(gl, vertText, fragText);
            const { vertices, indices, texcoords } = this._lerp(boundary);
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
            //2.create texcoord buffer
            const tBufferView = new GBufferView(
                gl,
                texcoords,
                texcoords.length,
                {
                    bufferType: gl.ARRAY_BUFFER,
                    drawType: gl.STATIC_DRAW,
                    byteOffset: 0,
                    byteStride: 0
                }
            );
            const tAccessor = new GAccessor(
                gProgram,
                tBufferView,
                gl.FLOAT,
                'VEC2',
                texcoords.length/3,
                {
                    byteOffset: 0,
                    normalized: false
                }
            );
            tAccessor.bindBuffer();
            tAccessor.bufferData();
            tAccessor.link('a_texcoord');
            //2. create indices buffer
            const iBuffer = new GBuffer(
                gProgram,
                new Uint16Array(indices),
                gl.ELEMENT_ARRAY_BUFFER,
                gl.STATIC_DRAW);
            iBuffer.bindBuffer();
            iBuffer.bufferData();
            //3.uniform
            const uTexture = new GUniform(gProgram, 'u_texture'),
                uProjection = new GUniform(gProgram, 'u_projectionMatrix'),
                uView = new GUniform(gProgram, 'u_viewMatrix'),
                uModel = new GUniform(gProgram, 'u_modelMatrix');
            //3.create texture image2d
            const gTexture = new GTexture(
                gl, 
                arraybuffer, 
                width, 
                height, 
                gl.RGBA, 
                gl.RGBA, 
                gl.UNSIGNED_BYTE, 
                gl.TEXTURE_2D);
            gTexture.bindTexture();
            gTexture.texImage2D();
            //4.cache resource
            tileCache.gProgram = gProgram;
            tileCache.vAccessor = vAccessor;
            tileCache.tAccessor = tAccessor;
            tileCache.iBuffer = iBuffer;
            tileCache.iLength = indices.length;
            tileCache.uProjection = uProjection;
            tileCache.uTexture = uTexture;
            tileCache.uView = uView;
            tileCache.uModel = uModel;
            tileCache.gTexture = gTexture;
            //cache tile
            tileCaches[key] = tileCache;
        });
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
