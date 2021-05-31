
/**
 * worker 执行状态描述
 */
enum WorkerStatus {
    OK = 'ok',
    FAIL = 'fail'
}

/**
 * 定义消息通讯的数据类型
 * 约定与主线程传送消息的数据结构
 * - 可序列化对象
 * - transferable 对象
 */
interface IMessagebus {

    /**
     * 消息ID
     */
    workerKey: string,

    /**
     * worker执行状态
     */
    status?: WorkerStatus

    /**
     * 消息
     */
    msg?: string,

    /**
     * 传入参数，类似...args
     */
    args?: any[],

    /**
     * 图像处理结果
     */
    buffer?: TransferableType,
}

type TransferableType = Uint8Array | ImageBitmap;

/** 
 * 支持的worker类型 
 * 非常驻任务
 */
enum ShorttermSupportWorkerType {

}

/**
 * 支持的worker类型 
 * 常驻任务
 */
enum LongtermSupportWorkerType {

    /** MVT 矢量瓦片解析服务*/
    VectorTileWorker = 'VectorTileWorker',

    /** 地形解析服务 */
    // TerrainTileWorker = 'TerrainTileWorker',

    /** 工参图层解析服务（pbf编码) */
    EParamterTileWorker = 'EParamterTileWorker',
}

export { IMessagebus, WorkerStatus, ShorttermSupportWorkerType, LongtermSupportWorkerType }
