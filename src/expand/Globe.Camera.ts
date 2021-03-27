import { Vec3 } from 'kiwi.matrix';
import { Globe } from './Globe';
import { Camera } from './../camera/Camera';
import { PerspectiveCamera } from './../camera/PerspectiveCamera';
import { Ray } from './../core/Ray';
import { GeodeticCoordinate } from '../core/GeodeticCoordinate';
/**
 * 地图容器区域信息
 */
interface IViewContainer {
    left: number,
    top: number,
    width: number,
    height: number,
    cx: number, // container center x
    cy: number  // container center y
}
/**
 * 屏幕坐标
 */
interface IPoint {
    clientX: number;
    clientY: number;
}
/**
 * View支持，在Camear下支持
 * -LOD
 * -坐标转换(ndc，大地坐标，空间坐标等)
 */
declare module './Globe' {
    interface Globe {
        //初始化相机
        registerCamera(coord: GeodeticCoordinate): void;
        camera: Camera;
        view: IViewContainer;
        //获取屏幕坐标与空间坐标(0,0,0)连线，与参考椭球体表面相交点坐标
        rayTrackOnSphere(point: IPoint): Vec3
        normalizedDeviceCoordinate(point: IPoint): Vec3;
        //地理坐标转换成空间坐标，支持地面高度转换
        geographicToSpaceCoordinate(coord: GeodeticCoordinate): Vec3
        normalizedDeviceCoordinateToSpaceCoordinate(pndc: Vec3): Vec3;
        spaceCoordinateToNormaziledDeveiceCoordinate(spaceCoord: Vec3): Vec3;
    }
}

Globe.prototype.registerCamera = function (coord: GeodeticCoordinate): void {
    const ctx = this as Globe;
    //1. 获取element信息
    const box = ctx.canvas.getBoundingClientRect(),
        dom = ctx.canvas.ownerDocument.documentElement;
    //2. 获取view信息
    const left = box.left + window.pageXOffset - dom.clientLeft,
        top = box.top + window.pageYOffset - dom.clientTop,
        width = box.width,
        height = box.height;
    //3. 计算
    ctx.view = {
        left,
        top,
        width,
        height,
        cx: left + width / 2,
        cy: top + height / 2
    };
    //4. 初始化相机, 
    ctx.camera = new PerspectiveCamera(50, width, height, 0.1, ctx.ellipsoid.maximumRadius * 2);
    const p0 = ctx.geographicToSpaceCoordinate(coord);
    ctx.camera.position.set(p0.x, p0.y, p0.z);
    ctx.camera.lookAt(new Vec3().set(0, 0, 0));
}
/**
 * 获取屏幕坐标与空间坐标(0,0,0)连线，与参考椭球体表面相交点坐标
 */
Globe.prototype.rayTrackOnSphere = function (point: IPoint): Vec3 {
    const ctx = this as Globe;
    const pndc = ctx.normalizedDeviceCoordinate(point);
    const space = ctx.normalizedDeviceCoordinateToSpaceCoordinate(pndc);
    const d = space.sub(ctx.camera.position.clone()).normalize();
    const ray = new Ray(ctx.camera.position.clone(), d);
    return ray.intersectSphere(ctx.ellipsoid);
}
/**
 * 通过ClientX,ClientY换算成设备的NDC坐标
 * 输入容器中client坐标
 */
Globe.prototype.normalizedDeviceCoordinate = function (point: IPoint): Vec3 {
    const ctx = this as Globe;
    const x = (point.clientX / ctx.view.width) * 2 - 1,
        y = -(point.clientY / ctx.view.height) * 2 + 1;
    return new Vec3().set(x, y, 1);
}
/**
 * ndc坐标换算成空间坐标
 */
Globe.prototype.normalizedDeviceCoordinateToSpaceCoordinate = function (pndc: Vec3): Vec3 {
    const ctx = this as Globe;
    const m4 = ctx.camera.viewMatrix.clone().multiply(ctx.camera.projectionMatrix.clone().invert()),
        space = pndc.clone().applyMatrix4(m4);
    return space;
}
/**
 * space coordinate
 */
Globe.prototype.spaceCoordinateToNormaziledDeveiceCoordinate = function (space: Vec3): Vec3 {
    const ctx = this as Globe;
    const ndc = space.clone().applyMatrix4(ctx.camera.viewProjectionMatrix);
    return ndc;
}

Globe.prototype.geographicToSpaceCoordinate = function (coord: GeodeticCoordinate): Vec3 {
    const ctx = this as Globe;
    const space = ctx.ellipsoid.geographicToSpace(coord);
    return space;
}

// Globe.registerHook(Globe.prototype.registerCamera, new GeodeticCoordinate(114.32345, 33.31283, 100000));

export { IPoint }