const fetch = require("../../src/utils/fetch");
const TYPES = ["SCALAR", 1, "VEC2", 2, "VEC3", 3, "VEC4", 4, "MAT2", 4, "MAT3", 9, "MAT4", 16];
/**
 * @class
 */
class Accessor {

    constructor(rootPath, gltf, glbBuffer) {
        this.rootPath = rootPath;
        this.gltf = gltf;
        this.glbBuffer = glbBuffer;
        this.buffers = {};
        this.requests = {};
    }

    _requestData(name, accessorName) {
        const gltf = this.gltf,
            accessor = gltf.accessors[accessorName];
        const bufferView = gltf.bufferViews[accessor.bufferView],
            buffer = gltf.buffers[bufferView.buffer];
        if (bufferView.buffer === "binary_glTF" || bufferView.buffer === "KHR_binary_glTF" || !buffer.uri) {
            const { array, itemSize } = this._toTypedArray(accessorName, this.glbBuffer.buffer, this.glbBuffer.byteOffset);
            //from glb buffer
            return Promise.resolve({
                name, accessorName,
                array, itemSize
            });
        } else {
            //load from external uri
            const bin = buffer.uri;
            const url = buffer.uri.indexOf("data:application/") === 0 ? buffer.uri : this.rootPath + "/" + bin;
            if (this.requests[url]) {
                // a promise already created
                return this.requests[url].then(() => {
                    const { array, itemSize } = this._toTypedArray(accessorName, this.buffers[url]);
                    return {
                        name, accessorName,
                        array, itemSize
                    };
                });
            }
            const promise = this.requests[url] = fetch(url,{
                responseType:"arraybuffer"
            }).
            then(response=>{
               return response.arrayBuffer();
            }).
            then(buffer=>{
                this.buffers[url] = buffer;
                const { array, itemSize } = this._toTypedArray(accessorName, buffer);
                return {
                    name, accessorName,
                    array, itemSize
                };
            });
            return promise;
        }
    }

    _toTypedArray(accessorName, arrayBuffer, offset = 0) {
        const gltf = this.gltf;
        const accessor = gltf.accessors[accessorName];
        const bufferView = gltf.bufferViews[accessor.bufferView];
        let start = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0) + offset;
        const itemSize = this._getTypeItemSize(accessor.type);
        const ArrayCtor = this._getArrayCtor(accessor.componentType);
        const byteStride = accessor.byteStride;
        if (byteStride && byteStride !== itemSize * ArrayCtor.BYTES_PER_ELEMENT) {
            console.warn("GLTF interleaved accessors not supported");
            return new ArrayCtor([]);
        }
        if (start % ArrayCtor.BYTES_PER_ELEMENT !== 0) {
            //拷贝 array buffer，以保证比特对齐
            //有些不太正规的数据没有比特对齐，此时 new Float32Array(offset,.. ) 会抛出 offset must be multiplier of 4 错误
            arrayBuffer = arrayBuffer.slice(start, start + accessor.count * itemSize * ArrayCtor.BYTES_PER_ELEMENT);
            start = 0;
        }
        return {
            array : new ArrayCtor(arrayBuffer, start, accessor.count * itemSize),
            itemSize
        };
    }

    _getArrayCtor(componentType) {
        switch (componentType) {
        case 0x1400:
            return Int8Array;
        case 0x1401:
            return Uint8Array;
        case 0x1402:
            return Int16Array;
        case 0x1403:
            return Uint16Array;
        case 0x1404:
            return Int32Array;
        case 0x1405:
            return Uint32Array;
        case 0x1406:
            return Float32Array;
        }
        throw new Error("unsupported bufferView's componeng type: " + componentType);
    }

    _getTypeItemSize(type) {
        const typeIdx = TYPES.indexOf(type);
        return TYPES[typeIdx + 1];
    }

}

module.exports = Accessor;