import { BinaryBuffer } from "./buffer";
import { has, isPlainObject } from "./guards";
export const BinSymbol = Symbol("Bin");
export var BinaryComponentType;
(function (BinaryComponentType) {
    BinaryComponentType[BinaryComponentType["NULL"] = 0] = "NULL";
    BinaryComponentType[BinaryComponentType["BYTE"] = 1] = "BYTE";
    BinaryComponentType[BinaryComponentType["BOOL"] = 2] = "BOOL";
    BinaryComponentType[BinaryComponentType["CHAR"] = 3] = "CHAR";
    BinaryComponentType[BinaryComponentType["INT32"] = 4] = "INT32";
    BinaryComponentType[BinaryComponentType["INT64"] = 5] = "INT64";
    BinaryComponentType[BinaryComponentType["UINT32"] = 6] = "UINT32";
    BinaryComponentType[BinaryComponentType["UINT64"] = 7] = "UINT64";
    BinaryComponentType[BinaryComponentType["FLOAT32"] = 8] = "FLOAT32";
    BinaryComponentType[BinaryComponentType["FLOAT64"] = 9] = "FLOAT64";
    BinaryComponentType[BinaryComponentType["BINARY"] = 10] = "BINARY";
})(BinaryComponentType || (BinaryComponentType = {}));
export var BinaryType;
(function (BinaryType) {
    BinaryType[BinaryType["SCALAR"] = 0] = "SCALAR";
    BinaryType[BinaryType["ARRAY"] = 1] = "ARRAY";
    BinaryType[BinaryType["OBJECT"] = 2] = "OBJECT";
    BinaryType[BinaryType["STRING"] = 3] = "STRING";
})(BinaryType || (BinaryType = {}));
export const isBin = (x) => {
    if (typeof x !== "object" || x === null)
        return false;
    return has(x, "bin") && x.bin === BinSymbol;
};
export var bin;
(function (bin) {
    bin.nil = () => ({
        componentType: BinaryComponentType.NULL,
        type: BinaryType.SCALAR,
        count: 0,
        data: new BinaryBuffer(),
        bin: BinSymbol,
    });
    bin.int32 = (value) => ({
        componentType: BinaryComponentType.INT32,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeInt32(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.int64 = (value) => ({
        componentType: BinaryComponentType.INT64,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeInt64(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.uint32 = (value) => ({
        componentType: BinaryComponentType.UINT32,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeUint32(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.uint64 = (value) => ({
        componentType: BinaryComponentType.UINT64,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeUint64(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.float32 = (value) => ({
        componentType: BinaryComponentType.FLOAT32,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeFloat32(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.float64 = (value) => ({
        componentType: BinaryComponentType.FLOAT64,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeFloat64(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.byte = (value) => ({
        componentType: BinaryComponentType.BYTE,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeByte(value);
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.bool = (value) => ({
        componentType: BinaryComponentType.BOOL,
        type: BinaryType.SCALAR,
        count: 1,
        data: (() => {
            const buff = new BinaryBuffer();
            buff.writeByte(Number(value));
            buff.setCursor(0);
            return buff;
        })(),
        bin: BinSymbol,
    });
    bin.char = (value) => {
        const buff = new BinaryBuffer();
        buff.writeChar(value);
        buff.setCursor(0);
        return {
            componentType: BinaryComponentType.CHAR,
            type: BinaryType.SCALAR,
            count: buff.data.length,
            data: buff,
            bin: BinSymbol,
        };
    };
    bin.string = (value) => {
        const buff = new BinaryBuffer();
        buff.writeString(value);
        buff.setCursor(0);
        return {
            componentType: BinaryComponentType.CHAR,
            type: BinaryType.STRING,
            count: buff.data.length,
            data: buff,
            bin: BinSymbol,
        };
    };
    bin.array = (...args) => ({
        componentType: BinaryComponentType.BINARY,
        type: BinaryType.ARRAY,
        count: args.length,
        data: args,
        bin: BinSymbol,
    });
    bin.object = (data) => {
        return {
            componentType: BinaryComponentType.BINARY,
            type: BinaryType.OBJECT,
            count: data instanceof Map ? data.size : Object.entries(data).length,
            data: data instanceof Map ? data : new Map(Object.entries(data)),
            bin: BinSymbol,
        };
    };
    function auto(x) {
        if (typeof x === "undefined" || x === null)
            return bin.nil();
        if (isBin(x))
            return x;
        if (Array.isArray(x)) {
            return bin.array(...x.map((v) => auto(v)));
        }
        switch (typeof x) {
            case "number": {
                if (Number.isInteger(x))
                    return bin.int32(x);
                return bin.float32(x);
            }
            case "string":
                return bin.string(x);
            case "boolean":
                return bin.bool(x);
            case "symbol":
                return bin.string(x.toString());
            case "undefined":
                return bin.nil();
            case "bigint":
                return bin.int64(x);
            case "function":
                return bin.nil();
            case "object": {
                if (!isPlainObject(x))
                    return bin.nil();
                const m = new Map();
                for (const [k, v] of Object.entries(x)) {
                    m.set(k, auto(v));
                }
                return bin.object(m);
            }
        }
        return bin.nil();
    }
    bin.auto = auto;
})(bin || (bin = {}));
//# sourceMappingURL=binary.js.map