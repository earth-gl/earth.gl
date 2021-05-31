import { IMessagebus } from "..";
import { WorkerStatus } from "../core/WorkerProtocol";
import { requestMVT } from "../utils/requestMVT";

/**
 * 处理MVT数据，传递绘制结果
 * @param evt MessageEvent<IMessagebus>
 */
self.onmessage = (evt: MessageEvent<IMessagebus>) => {
    const d = evt.data;
    const key = evt.data.workerKey;
    const baseUri = d.args[0],
        x = d.args[1],
        y = d.args[2],
        level = d.args[3],
        ratio = d.args[4],
        token = d.args[5];
    const uri = `${baseUri}/${level}/${x}/${y}.mvt?access_token=${token}`;
    requestMVT(uri, key, ratio)
        .then((v: { key: string, buffer: Uint8Array, width: number, height: number }) => {
            const messageBus: IMessagebus = {
                workerKey: v.key,
                status: WorkerStatus.OK,
                args: [v.width, v.height],
                buffer: v.buffer
            };
            //}{ debug, transferable传法, ts里targetOrigin传入参数后会报错
            (self as unknown as ServiceWorker).postMessage(messageBus, [v.buffer.buffer]);
        })
        .catch(() => {
            const messageBus: IMessagebus = {
                workerKey: key,
                status: WorkerStatus.FAIL,
            };
            (self as unknown as ServiceWorker).postMessage(messageBus);
        });
}
