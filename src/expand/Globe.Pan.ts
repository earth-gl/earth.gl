import { Quat, Vec2, Vec3 } from 'kiwi.matrix';
import { Globe } from './Globe';
import { IPoint } from './Globe.Camera'
import { PAN_EVENTS, IPanEventParam } from './handler/Globe.Handler.Pan';
import './Globe.Quadtree';

declare module './Globe' {
    interface Globe {
        registerPanEvent(): void;
        releasePanEvent(): void;
        //
        onPanStart(args: IPanEventParam): void;
        onPaning(args: IPanEventParam): void;
        onPanend(args: IPanEventParam): void;
        //
        pan(from: Vec3, to: Vec3): void;
        //
        m_lastRotateGlobeFromVector: Vec3;
        m_lastRotateGlobeAxis: Vec3;
        m_lastRotateGlobeAngle: number;
        //记录鼠标的 clientX, clientY
        m_lastPostition: IPoint;
        m_rotateGlobeQuaternion: Quat;
    }
}
/**
 * 
 */
Globe.prototype.registerPanEvent = function () {
    const ctx = this as Globe;
    //注册事件
    ctx.on(PAN_EVENTS.panstart, ctx.onPanStart);
    ctx.on(PAN_EVENTS.paning, ctx.onPaning);
    ctx.on(PAN_EVENTS.panend, ctx.onPanend);
}
/**
 * fm, 起始：鼠标与中心连线，与地球表明相交的点的空间坐标Vec3
 * to, 终止：鼠标与中心连线，与地球表明相交的点的空间坐标Vec3
 */
Globe.prototype.pan = function (fm: Vec3, to: Vec3): void {
    const ctx = this as Globe;
    // Assign the new animation start time.
    ctx.m_lastRotateGlobeFromVector = fm.clone();
    ctx.m_lastRotateGlobeAxis = fm.clone().cross(to).normalize();
    ctx.m_lastRotateGlobeAngle = fm.angle(to);
    //旋转四元数
    ctx.m_rotateGlobeQuaternion = new Quat().setAxisAngle(ctx.m_lastRotateGlobeAxis, -ctx.m_lastRotateGlobeAngle);
    const offset = ctx.camera.position.clone().sub(ctx.camera.target.clone());
    offset.applyQuat(ctx.m_rotateGlobeQuaternion);
    ctx.camera.up.applyQuat(ctx.m_rotateGlobeQuaternion);
    //更新相机位置
    const postiton = offset.add(ctx.camera.target.clone());
    ctx.camera.position.set(postiton.x, postiton.y, postiton.z);
    ctx.updateQuadtreeTileByDistanceError();
}
/**
 * 
 */
Globe.prototype.onPanStart = function (args: IPanEventParam): void {
    const ctx = this as Globe;
    ctx.m_lastPostition = {
        clientX: args.currentPosition.x,
        clientY: args.currentPosition.y,
    }
}
/**
 * 
 */
Globe.prototype.onPaning = function (args: IPanEventParam): void {
    const ctx = this as Globe;
    const tc = {
        clientX: args.currentPosition.x,
        clientY: args.currentPosition.y
    };
    const fm = ctx.rayTrackOnSphere(ctx.m_lastPostition);
    const to = ctx.rayTrackOnSphere(tc);
    ctx.pan(fm, to);
    ctx.m_lastPostition.clientX = tc.clientX;
    ctx.m_lastPostition.clientY = tc.clientY;
}
/**
 * 
 */
Globe.prototype.onPanend = function (args: IPanEventParam): void {
    const ctx = this as Globe;
    console.log(args.domEvent.type);
}

Globe.registerHook(Globe.prototype.registerPanEvent);