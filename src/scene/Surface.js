
//util func
const requestImage = require('../utils/requestImage'),
    //core
    Geographic = require('../core/Geographic'),
    { WGS84 } = require('../core/Ellipsoid'),
    //object
    GBufferView = require('../object/GBufferView'),
    GAccessor = require('../object/GAccessor'),
    //render unit
    Texture = require('./../renderer/Texture'),
    Uniform = require('./../renderer/Uniform'),
    Buffer = require('./../renderer/Buffer'),
    Program = require('./../renderer/Program'),
    //shader glsl file
    fragText = require('./../shader/surface-fs.glsl'),
    vertText = require('./../shader/surface-vs.glsl');
/**
 * request terrain data for cesium server
 * @class
 */
class GSurface {
    /**
     * @typedef {import("../core/Quadtree")} Quadtree
     * @param {Quadtree} quadtree 
     */
    constructor() {
        /**
         * @type {WebGLRenderingContext}
         */
        this._gl = null;
        /**
         * @type {Quadtree}
         */
        this._quadtree = null;
        /**
         * @type {Object[]}
         * key-value: key=level-x-y, value:{program,buffer}
         */
        this._tileCaches = {};

    }
    /**
     * 
     * @param {*} gl 
     * @param {*} quadtree 
     */
    _init(gl, quadtree) {
        this._gl = gl;
        this._quadtree = quadtree;
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
        const { waitRendering } = o;
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
        const lerp = 8,
            factor = 1 / lerp,
            rangeX = boundary.width,
            rangeY = boundary.height,
            start = boundary.southwest;
        let texcoords = [],
            vertices = [],
            indices = [];
        for (let x = 0; x <= lerp; x++)
            for (let y = 0; y <= lerp; y++) {
                //convert to space
                //bug!不能直接使用线性加减得到方框顶点，而是需要从投影米级坐标计算
                const g1 = new Geographic(
                    start.longitude + x * factor * rangeX,
                    start.latitude + y * factor * rangeY,
                    0);
                //convert to space coord
                const spaceCoord = WGS84.geographicToSpace(g1);
                //push vertices
                vertices = vertices.concat(spaceCoord._out);
                //texcoords
                texcoords = texcoords.concat([x * factor, y * factor]);
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
                gProgram = new Program(gl, vertText, fragText);
            const { vertices, indices, texcoords } = this._lerp(boundary);
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
                gProgram,
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
            tAccessor.link('a_texcoord');
            //create indices buffer
            const iBuffer = new Buffer(
                gProgram,
                new Uint16Array(indices),
                gl.ELEMENT_ARRAY_BUFFER,
                gl.STATIC_DRAW);
            iBuffer.bindBuffer();
            iBuffer.bufferData();
            //create texture image2d
            const gTexture = new Texture(
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
     * @param {*} camera 
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
            uProjection.assignValue(camera.ProjectionMatrix);
            uView.assignValue(camera.ViewMatrix);
            uModel.assignValue(camera.IdentityMatrix);
            //draw polygon
            gl.drawElements(gl.TRIANGLES, iLength, gl.UNSIGNED_SHORT, 0);
        }
    }
}

module.exports = GSurface;
