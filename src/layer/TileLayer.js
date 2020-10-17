
//util func
const requestImage = require('../utils/requestImage'),
    interpolation = require('../utils/interpolation'),
    Object3D = require('../core/Object3D'),
    //object
    GBufferView = require('../renderer/GBufferView'),
    GAccessor = require('../renderer/GAccessor'),
    //render unit
    GTexture = require('../renderer/GTexture'),
    Uniform = require('../renderer/GUniform'),
    GBuffer = require('../renderer/GBuffer'),
    GProgram = require('../renderer/GProgram'),
    //shader glsl file
    fragText = require('./../shader/surface-fs.glsl'),
    vertText = require('./../shader/surface-vs.glsl');
/**
 * request terrain data for cesium server
 * @typedef {import('../camera/PerspectiveCamera')} PerspectiveCamera
 * @typedef {import("../core/Quadtree")} Quadtree
 * @class
 */
class ImagerySurface extends Object3D{
    /**
     * @param {Object} options
     * @param {String} options.uri the tile uri, such as 'https://c.basemaps.cartocdn.com/light_all/'
     */
    constructor(options) {
        super();
        /**
         * @type {Quadtree}
         */
        this._quadtree = null;
        /**
         * key-value: key=level-x-y, value:{program,buffer}
         * @type {Object[]}
         */
        this._tileCaches = {};
    }
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {Quadtree} quadtree 
     */
    hook(gl, quadtree){
        super.hook(gl);
        this._quadtree = quadtree;
         //register event with updateTiles
         this._quadtree.on('updatedTiles', this._updateTiles, this);
    }
    /**
     * @param o
     */
    _updateTiles(o) {
        const { waitRendering } = o;
        //1. request images,len = waitRendering.length
        for (let i = 0, len = waitRendering.length; i < len; i++) {
            const qudatreeTile = waitRendering[i];
            this._request(qudatreeTile);
        }
    }
    /**
     * 
     * @param {import('../core/QuadtreeTile')} qudatreeTile 
     */
    _request(qudatreeTile) {
        const gl = this._gl,
            { x, y, level, boundary } = qudatreeTile,
            key = x + '-' + y + '-' + level,
            width = 256,
            height = 256,
            tileCaches = this._tileCaches;
        //check tile cached
        if (tileCaches[key]) return;
        //https://c.basemaps.cartocdn.com/light_all/
        //https://a.tile.openstreetmap.org
        //https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer/tile/
        //   uri = baseUri + level + '/' + x + '/' + y+ '.png';
        const baseUri = 'https://c.basemaps.cartocdn.com/light_all/',
            uri = baseUri + level + '/' + x + '/' + y + '.png';
        //request image
        requestImage(uri).then(arraybuffer => {
            //create program
            const tileCache = {},
                gProgram = new GProgram(gl, vertText, fragText);
            const { vertices, indices, texcoords } = interpolation(boundary);
            gProgram.useProgram();
            //create vertices buffer
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
                gl,
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
            vAccessor.link(gProgram,'a_position');
            //create texcoord buffer
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
                gl,
                tBufferView,
                gl.FLOAT,
                'VEC2',
                texcoords.length / 3,
                {
                    byteOffset: 0,
                    normalized: false
                }
            );
            tAccessor.bindBuffer();
            tAccessor.bufferData();
            tAccessor.link(gProgram, 'a_texcoord');
            //create indices buffer
            const iBuffer = new GBuffer(
                gl,
                new Uint16Array(indices),
                gl.ELEMENT_ARRAY_BUFFER,
                gl.STATIC_DRAW);
            iBuffer.bindBuffer();
            iBuffer.bufferData();
            //create texture image2d
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
            //uniform
            const uTexture = new Uniform(gProgram, 'u_texture'),
                uProjection = new Uniform(gProgram, 'u_projectionMatrix'),
                uView = new Uniform(gProgram, 'u_viewMatrix'),
                uModel = new Uniform(gProgram, 'u_modelMatrix');
            //cache resource
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
     * @param {PerspectiveCamera} camera 
     */
    render(camera) {
        const gl = this._gl,
            tileCaches = this._tileCaches;
        for (const key in tileCaches) {
            const tileCache = tileCaches[key],
                {
                    uProjection,
                    uView,
                    uModel,
                    iLength,
                    gProgram,
                    vAccessor,
                    iBuffer,
                    tAccessor,
                    uTexture,
                    gTexture
                } = tileCache;
            //use program
            gProgram.useProgram();
            //bind vertex buffer a_position
            vAccessor.bindBuffer();
            vAccessor.relink();
            //bind uv buffer, a_texcoord
            tAccessor.bindBuffer();
            tAccessor.relink();
            //bind indices buffer
            iBuffer.bindBuffer();
            //active texture
            gTexture.bindTexture();
            //set texture
            uTexture.assignValue(0);
            //set camera
            uProjection.assignValue(camera.ProjectionMatrixValue);
            uView.assignValue(camera.InvertViewMatrixValue);
            uModel.assignValue(camera.IdentityMatrixValue);
            //draw polygon
            gl.drawElements(gl.TRIANGLES, iLength, gl.UNSIGNED_SHORT, 0);
        }
    }
}

module.exports = ImagerySurface;
