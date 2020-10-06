/**
 * 声明文件
 */

/**
 * 核心对象，object3D
 */
export interface IObject3D {
  /**
   * 
   */
  readonly id: string;
}

/**
 * GPU性能选项 
 */
export enum GPUPowerPreference {
  'low-power',
  'high-performance'
}