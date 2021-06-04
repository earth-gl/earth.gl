import { Camera } from "../camera/Camera";

/**
 * - Globe
 * - Sketchpad
 */
interface IRenderer {
    /** 
     * 执行一次渲染
     */
    render(framestamp: number, camera: Camera): void;
}

export { IRenderer }
