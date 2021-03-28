import { Globe } from './Globe';
import './Globe.Camera'
import { QuadtreeTileSchema, webMercatorTileSchema } from './../core/QuadtreeTileSchema';
import { QuadtreeTile } from './../core/QuadtreeTile';
import { Vec3 } from 'kiwi.matrix';

//
const maximumScreenSpaceError = 2.0;
/**
 * 瓦片四叉树结构
 * 配合PersepcetiveCamera构建
 */
declare module './Globe' {
    interface Globe {
        registerQuadtree(tileSchema: QuadtreeTileSchema): void;
        pickZeroLevelQuadtreeTiles(position: Vec3): Array<QuadtreeTile>;
        computeMaximumGeometricError(level: number): number;
        computeZeroLevelTiles(): Array<QuadtreeTile>;
        computeSpaceError(quadtreeTile: QuadtreeTile): number;
        updateQuadtreeTileByDistanceError(): void;
        //当前globe的缩放层级
        level: number;
        //distance error划分
        geometricError: number[];
        //相机在不同缩放层级的最大高度
        maximumCameraHeight: number[];
        //初始化层Tileinfo
        zeroLevelTiles: Array<QuadtreeTile>;
        //视椎区全部瓦片
        visualRevealTiles:Array<QuadtreeTile>;
        //瓦片规范
        quadtreeTileSchema: QuadtreeTileSchema;
    }
}
/**
 * 
 */
Globe.prototype.registerQuadtree = function (tileSchema: QuadtreeTileSchema): void {
    const ctx = this as Globe;
    ctx.quadtreeTileSchema = tileSchema;
    ctx.geometricError = [];
    ctx.maximumCameraHeight = [];
    //视锥参数
    const sseDenominator = ctx.camera.frustrum.sseDenominator,
        height = ctx.view.height;
    for (let i = 0; i < 24; i++) {
        const geometricError = ctx.computeMaximumGeometricError(i);
        //计算geometric error
        ctx.geometricError[i] = geometricError
        //计算每个缩放层级摄像头最大高度
        ctx.maximumCameraHeight[i] = geometricError * height * 0.5 / sseDenominator;
    }
    //
    ctx.zeroLevelTiles = ctx.computeZeroLevelTiles();
    ctx.updateQuadtreeTileByDistanceError();
}
/**
 * 
 */
Globe.prototype.computeZeroLevelTiles = function (): Array<QuadtreeTile> {
    const ctx = this as Globe;
    const quadtreeTileSchema = ctx.quadtreeTileSchema,
        numberOfLevelZeroTilesX = quadtreeTileSchema.getNumberOfXTilesAtLevel(0),
        numberOfLevelZeroTilesY = quadtreeTileSchema.getNumberOfYTilesAtLevel(0),
        zeroLevelTiles = [];
    let seed = 0;
    for (let y = 0; y < numberOfLevelZeroTilesY; ++y)
        for (let x = 0; x < numberOfLevelZeroTilesX; ++x)
            zeroLevelTiles[seed++] = new QuadtreeTile(quadtreeTileSchema, x, y, 0, null);
    return zeroLevelTiles;
}
/**
 * 
 */
Globe.prototype.computeMaximumGeometricError = function (level: number): number {
    const ctx = this as Globe;
    const maximumGeometricError = ctx.ellipsoid.maximumRadius * 2 * Math.PI * 0.25 / (65 * ctx.quadtreeTileSchema.getNumberOfXTilesAtLevel(level));
    return maximumGeometricError;
}
/**
 * 
 */
Globe.prototype.pickZeroLevelQuadtreeTiles = function (position: Vec3): Array<QuadtreeTile> {
    const ctx = this as Globe;
    const zeroLevelQuadtreeTiles = ctx.zeroLevelTiles,
        pickedZeroLevelQuadtreeTiles = [];
    //1.转换camera位置与原点连线到地球表明
    const geodeticCoordinate = ctx.ellipsoid.spaceToGeographic(position);
    //2.计算tile rangele与geocoord相交
    zeroLevelQuadtreeTiles.forEach((quadtreeTile) => {
        quadtreeTile.boundary.contain(geodeticCoordinate) ? pickedZeroLevelQuadtreeTiles.push(quadtreeTile) : null;
    });
    return pickedZeroLevelQuadtreeTiles;
}
/**
 * 根据摄像机的位置计算地球上的瓦片对应的spaceError
 */
Globe.prototype.computeSpaceError = function (quadtreeTile: QuadtreeTile): number {
    const ctx = this as Globe;
    //摄像机位置与瓦片中心的距离,距离由两部分构成
    //1.相机在椭球体上的投影点
    const level = quadtreeTile.level,
        maxGeometricError = ctx.geometricError[level],
        sseDenominator = ctx.camera.frustrum.sseDenominator,
        height = ctx.view.height,
        cameraSpacePosition = ctx.camera.position.clone(),
        bounds = quadtreeTile.boundary.bounds;
    //2.投影点与目标tile的球面距离+相机距离球面距离 bug
    //2019/2/10 修正，改为与四角的距离取最大error
    let err = 0;
    for (let i = 0, len = bounds.length; i < len; i++) {
        const spacePostion = ctx.ellipsoid.geographicToSpace(bounds[i]);
        const distance = cameraSpacePosition.clone().sub(spacePostion).len();
        const error = (maxGeometricError * height) / (distance * sseDenominator);
        err = error > err ? error : err;
    }
    return err;
}

Globe.prototype.updateQuadtreeTileByDistanceError = function ():void {
    const ctx = this as Globe;
    const position = ctx.camera.position.clone();
    let level = 0;
    const rootTiles = ctx.pickZeroLevelQuadtreeTiles(position);
    //wait rendering
    const rawQuadtreeTiles = [];
    const renderingQuadtreeTiles = [];
    //liter func, to calcute new tile in distance error
    const liter = (quadtreeTile: QuadtreeTile) => {
        const error = ctx.computeSpaceError(quadtreeTile);
        if (error > maximumScreenSpaceError)
            for (let i = 0; i < 4; i++)
                liter(quadtreeTile.children[i]);
        else {
            const litLevel = quadtreeTile.level;
            level = litLevel > level ? litLevel : level;
            rawQuadtreeTiles.push(quadtreeTile);
        }
    };
    //calcute from root tile
    for (let i = 0, len = rootTiles.length; i < len; i++) {
        const tile = rootTiles[i];
        liter(tile);
    }
    //filter level of tile
    for (let i = 0, len = rawQuadtreeTiles.length; i < len; i++) {
        const quadtreeTile = rawQuadtreeTiles[i];
        quadtreeTile.level === level ? renderingQuadtreeTiles.push(quadtreeTile) : null;
    }
    //set current level
    ctx.level = level;
    ctx.visualRevealTiles =  renderingQuadtreeTiles;
    //}{debug
    console.log(ctx.visualRevealTiles);
}

//注册web墨卡托瓦片规则
Globe.registerHook(Globe.prototype.registerQuadtree, webMercatorTileSchema);