import { workerLib } from './WorkerLib';
import { WorkerWarp } from './WorkerWarp';
import { IMessagebus, LongtermSupportWorkerType, ShorttermSupportWorkerType, WorkerStatus } from './WorkerProtocol';

/*** 逻辑线程数*/
const hardwareConcurrency = window.navigator.hardwareConcurrency || 4;

/*** 能启用的前端线程上限，按照物理核心算（主流处理器为1核心2线程）*/
const workerCount = Math.max(Math.floor(hardwareConcurrency / 2), 1);

/** 常驻任务限制 */
const longtermWorkerLimit = workerCount / 2;

/** 短期任务限制 */
const shorttermWorkerLimit = workerCount - longtermWorkerLimit;

/**
 * 请注意：longtermWorker随系统启动
 * - 不提供线程销毁程序
 * - 目前仅MVT线程需要常驻
 */
class LongtermWorkerPool {

    /**
     * 单个常驻任务最多能占用的线程数
     */
    private static _singleWorkerLimit: number;

    /**
     * workerMap
     */
    private static _workerMap: Map<LongtermSupportWorkerType, Array<Worker>> = new Map();

    /**
     * 任务队列
     */
    public static _workerQueue: Map<LongtermSupportWorkerType, Array<WorkerWarp>> = new Map();

    /**
     * 初始化Worker资源
     */
    public static workerInit() {
        //常驻任务数
        const num = Object.keys(LongtermSupportWorkerType).length;
        //分配给单个常驻任务数量上限
        LongtermWorkerPool._singleWorkerLimit = Math.max(longtermWorkerLimit / num, 2);
        for (const key in LongtermSupportWorkerType) {
            const workerType = key as LongtermSupportWorkerType;
            //初始化worker
            const uri = workerLib.get(workerType);
            const wks: Array<Worker> = [];
            for (let k = 0; k < LongtermWorkerPool._singleWorkerLimit; k++) {
                const wk = new Worker(uri);
                wks.push(wk);
            }
            LongtermWorkerPool._workerMap.set(key as LongtermSupportWorkerType, wks);
            //初始化队列
            LongtermWorkerPool._workerQueue.set(workerType, []);
        }
    }

    /**
     * 请求worker
     * @param workerType
     */
    private static borrowtWorker = (workerType: LongtermSupportWorkerType): Worker => {
        //获取worker
        const wk = LongtermWorkerPool._workerMap.get(workerType).shift();
        return wk;
    }

    /**
     * 归还worker
     * @param wp 
     */
    private static givebackWorker = (wp: WorkerWarp): void => {
        const workerType = wp.workerType as LongtermSupportWorkerType, wk = wp.worker;
        LongtermWorkerPool._workerMap.get(workerType).push(wk);
    }

    /**
     * 
     * @param workerType 
     */
    public static hasIdleWorker = (workerType: LongtermSupportWorkerType) => {
        return LongtermWorkerPool._workerMap.get(workerType).length > 0;
    }

    /**
     * 请求worker
     * @param workerType 
     * @param data 
     * @retrun 成功返回Promse，失败返回null
     */
    public static acquireWorker = (workerType: LongtermSupportWorkerType, data: IMessagebus): Promise<IMessagebus> | null => {
        return LongtermWorkerPool.hasIdleWorker(workerType) ? new Promise<IMessagebus>((resolve: Function, reject: Function) => {
            const wp = new WorkerWarp(workerType, data);
            const wk = LongtermWorkerPool.borrowtWorker(workerType);
            wp.onMessage = (ev: MessageEvent<IMessagebus>) => {
                wp.releaseMessage();
                LongtermWorkerPool.givebackWorker(wp);
                wp.releaseWroker();
                //完成后的回调
                ev.data.status === WorkerStatus.OK ? resolve(ev.data) : reject(ev.data);
            };
            if (!wk) {
                LongtermWorkerPool._workerQueue.get(workerType).push(wp);
            } else {
                wp.registerWorker(wk);
                wp.postData();
            }
        }) : null;
    }

    /**
     * 
     * @param workerType 
     * @param data 
     */
    public static enqueueWorker = (workerType: LongtermSupportWorkerType, data: IMessagebus): Promise<IMessagebus> => {
        return new Promise<IMessagebus>((resolve: Function, reject: Function) => {
            const wp = new WorkerWarp(workerType, data);
            const wk = LongtermWorkerPool.borrowtWorker(workerType);
            wp.onMessage = (ev: MessageEvent<IMessagebus>) => {
                wp.releaseMessage();
                const nwp = LongtermWorkerPool._workerQueue.get(workerType).shift();
                console.log(`${workerType}:count:${LongtermWorkerPool._workerQueue.get(workerType).length}`);
                if (!!nwp) {
                    nwp.registerWorker(wp.worker);
                    nwp.postData();
                } else {
                    LongtermWorkerPool.givebackWorker(wp);
                    wp.releaseWroker();
                }
                //完成后的回调
                ev.data.status === WorkerStatus.OK ? resolve(ev.data) : reject(ev.data);
            };
            if (!wk) {
                LongtermWorkerPool._workerQueue.get(workerType).push(wp);
            } else {
                wp.registerWorker(wk);
                wp.postData();
            }
        });
    }
}

/**
 * 非常驻任务
 * - 销毁线程时会根据任务队列中是否还存在任务，如果有任务则继续执行，直到完成所有任务才销毁线程
 * - 线程的创建开销较大，非常驻线程多用于某类临时任务的处理
 * @example
 * 
 * //1. 创建线程
 * const pse = ShorttermWorkerPool.acquireWorker(workerType, {
 *      workerKey:"12131234"
 * });
 * 
 * //2. 销毁完成后的线程
 * pse.then((v:IMessagebus)=>{
 *      ShorttermWorkerPool.releaseWorker(v._wkp);
 * });
 * 
 */
class ShorttermWorkerPool {

    private static _workerCount: number = 0;

    private static _activeMap: Map<ShorttermSupportWorkerType, Array<WorkerWarp>> = new Map();

    private static _workerEnqueue: Array<WorkerWarp> = [];

    public static enqueueWorker = (workerType: ShorttermSupportWorkerType, data: IMessagebus): Promise<IMessagebus> => {
        //wp加入队列，等待register wk
        return new Promise<IMessagebus>((resolve: Function, reject: Function) => {
            const uri = workerLib.get(workerType);
            const workerWarp = new WorkerWarp(workerType, data);
            //如果线程未占满，则直接创建线程直接开始工作
            if (ShorttermWorkerPool._workerCount < shorttermWorkerLimit) {
                const wk = new Worker(uri, {});
                workerWarp.registerWorker(wk);
                ShorttermWorkerPool._workerCount++;
                if (!ShorttermWorkerPool._activeMap.get(workerType))
                    ShorttermWorkerPool._activeMap.set(workerType, [workerWarp]);
                else
                    ShorttermWorkerPool._activeMap.get(workerType).push(workerWarp);
                //传递数据
                workerWarp.postData();
            } else {
                //加入线程
                ShorttermWorkerPool._workerEnqueue.push(workerWarp);
            }
            //
            workerWarp.onMessage = (ev: MessageEvent<IMessagebus>) => {
                //完成后的回调
                resolve(ev.data);
                //释放worker资源
                ShorttermWorkerPool.releaseWorker(workerWarp);
            };
        });
    }

    public static releaseWorker = (workerWarp: WorkerWarp) => {
        const currentWorkerWarp = ShorttermWorkerPool._workerEnqueue.shift();
        //资源空闲，接着算
        if (currentWorkerWarp && workerWarp.workerType === currentWorkerWarp.workerType) {
            workerWarp.releaseMessage();
            currentWorkerWarp.registerWorker(workerWarp.worker);
            currentWorkerWarp.postData();
        }
        //创建新的
        else if (currentWorkerWarp) {
            const workerType = currentWorkerWarp.workerType;
            const uri = workerLib.get(workerType);
            const wk = new Worker(uri);
            currentWorkerWarp.registerWorker(wk);
            currentWorkerWarp.postData();
        }
        //无后续任务，销毁全部资源
        else {
            ShorttermWorkerPool._workerCount--;
            workerWarp.Dispose();
        }
    }
}

//初始化常驻worker
LongtermWorkerPool.workerInit();

export { ShorttermWorkerPool, LongtermWorkerPool }
