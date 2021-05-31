import { LongtermSupportWorkerType, ShorttermSupportWorkerType, IMessagebus } from "./WorkerProtocol";

/**
 * worker的封装
 */
class WorkerWarp {

    private _worker: Worker;

    private _workerType: LongtermSupportWorkerType | ShorttermSupportWorkerType;

    private _onMessage: Function;

    private _data: IMessagebus;

    public get worker(): Worker {
        return this._worker;
    }

    public get workerType(): LongtermSupportWorkerType | ShorttermSupportWorkerType {
        return this._workerType;
    }

    public set onMessage(v: Function) {
        this._onMessage = v;
    }

    constructor(workerType: LongtermSupportWorkerType | ShorttermSupportWorkerType, data: IMessagebus) {
        this._workerType = workerType;
        this._data = data;
    }

    postData(data: IMessagebus = null) {
        const d = data || this._data;
        this._worker.postMessage(d);
    }

    registerWorker(worker: Worker) {
        this._worker = worker;
        worker.onmessage = (e: MessageEvent<IMessagebus>) => {
            this._onMessage(e);
        }
    }

    Dispose(){
        this._worker.terminate();
        this.releaseMessage();
        this.releaseWroker();
    }

    releaseMessage() {
        this._worker.onmessage = null;
        this._onMessage = null;
    }

    releaseWroker() {
        this._worker = null;
    }
}

export { WorkerWarp }
