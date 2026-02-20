"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serial = void 0;
const binary_1 = require("./binary");
const buffer_1 = require("./buffer");
var serial;
(function (serial) {
    serial.decode = (buff) => {
        const bintype = buff.readInt32();
        const comptype = buff.readInt32();
        const count = buff.readInt32();
        switch (bintype) {
            case binary_1.BinaryType.STRING: {
                if (count <= 0)
                    return binary_1.bin.string("");
                return binary_1.bin.string(buff.readString(count));
            }
            case binary_1.BinaryType.SCALAR: {
                if (count <= 0)
                    return binary_1.bin.nil();
                switch (comptype) {
                    case binary_1.BinaryComponentType.BYTE:
                        return binary_1.bin.byte(buff.readByte());
                    case binary_1.BinaryComponentType.BOOL:
                        return binary_1.bin.bool(!!buff.readByte());
                    case binary_1.BinaryComponentType.CHAR:
                        return binary_1.bin.char(buff.readChar(count));
                    case binary_1.BinaryComponentType.INT32:
                        return binary_1.bin.int32(buff.readInt32());
                    case binary_1.BinaryComponentType.UINT32:
                        return binary_1.bin.uint32(buff.readUint32());
                    case binary_1.BinaryComponentType.INT64:
                        return binary_1.bin.int64(buff.readInt64());
                    case binary_1.BinaryComponentType.UINT64:
                        return binary_1.bin.uint64(buff.readUint64());
                    case binary_1.BinaryComponentType.FLOAT32:
                        return binary_1.bin.float32(buff.readFloat32());
                    case binary_1.BinaryComponentType.FLOAT64:
                        return binary_1.bin.float64(buff.readFloat64());
                    case binary_1.BinaryComponentType.NULL:
                        return binary_1.bin.nil();
                    case binary_1.BinaryComponentType.BINARY:
                        return binary_1.bin.array(serial.decode(buff));
                    default:
                        throw new Error("not reached");
                }
            }
            case binary_1.BinaryType.ARRAY: {
                const items = [];
                for (let i = 0; i < count; i++) {
                    const item = serial.decode(buff);
                    items.push(item);
                }
                return binary_1.bin.array(...items);
            }
            case binary_1.BinaryType.OBJECT: {
                const m = new Map();
                for (let i = 0; i < count; i++) {
                    const k = serial.decode(buff);
                    if (k.type !== binary_1.BinaryType.STRING)
                        throw new Error("Expected string");
                    k.data.saveCursor();
                    const ks = k.data.readString(k.count);
                    k.data.resetCursor();
                    const v = serial.decode(buff);
                    m.set(ks, v);
                }
                return binary_1.bin.object(m);
            }
            default:
                throw new Error(`not reached ${bintype}`);
        }
    };
    serial.encode = (binary, out = null) => {
        const buff = out || new buffer_1.BinaryBuffer();
        buff.saveCursor();
        const enc = (binary) => {
            buff.writeInt32(binary.type);
            buff.writeInt32(binary.componentType);
            buff.writeInt32(binary.count);
            switch (binary.type) {
                case binary_1.BinaryType.STRING: {
                    buff.write(binary.data);
                    return buff;
                }
                case binary_1.BinaryType.SCALAR: {
                    switch (binary.componentType) {
                        case binary_1.BinaryComponentType.NULL:
                            return buff;
                        case binary_1.BinaryComponentType.CHAR:
                        case binary_1.BinaryComponentType.INT32:
                        case binary_1.BinaryComponentType.UINT32:
                        case binary_1.BinaryComponentType.INT64:
                        case binary_1.BinaryComponentType.UINT64:
                        case binary_1.BinaryComponentType.FLOAT32:
                        case binary_1.BinaryComponentType.FLOAT64:
                        case binary_1.BinaryComponentType.BOOL:
                        case binary_1.BinaryComponentType.BYTE: {
                            buff.write(binary.data);
                            return buff;
                        }
                    }
                }
                case binary_1.BinaryType.ARRAY: {
                    for (const b of binary.data) {
                        enc(b);
                    }
                    return buff;
                }
                case binary_1.BinaryType.OBJECT: {
                    binary.data.forEach((b, k) => {
                        enc(binary_1.bin.string(k));
                        enc(b);
                    });
                    return buff;
                }
            }
        };
        const result = enc(binary);
        buff.resetCursor();
        return result;
    };
    serial.toJS = (x) => {
        const convert = (x) => {
            switch (x.type) {
                case binary_1.BinaryType.STRING: {
                    return x.data.with((buff) => buff.readString(x.count));
                }
                case binary_1.BinaryType.SCALAR: {
                    switch (x.componentType) {
                        case binary_1.BinaryComponentType.BYTE:
                            return x.data.with((buff) => buff.readByte());
                        case binary_1.BinaryComponentType.BOOL:
                            return x.data.with((buff) => !!buff.readByte());
                        case binary_1.BinaryComponentType.CHAR:
                            return x.data.with((buff) => buff.readChar());
                        case binary_1.BinaryComponentType.INT32:
                            return x.data.with((buff) => buff.readInt32());
                        case binary_1.BinaryComponentType.UINT32:
                            return x.data.with((buff) => buff.readUint32());
                        case binary_1.BinaryComponentType.INT64:
                            return x.data.with((buff) => buff.readInt64());
                        case binary_1.BinaryComponentType.UINT64:
                            return x.data.with((buff) => buff.readUint64());
                        case binary_1.BinaryComponentType.FLOAT32:
                            return x.data.with((buff) => buff.readFloat32());
                        case binary_1.BinaryComponentType.FLOAT64:
                            return x.data.with((buff) => buff.readFloat64());
                        case binary_1.BinaryComponentType.NULL:
                            return null;
                        default:
                            throw new Error("Not reached");
                    }
                }
                case binary_1.BinaryType.ARRAY: {
                    return x.data.map((v) => convert(v));
                }
                case binary_1.BinaryType.OBJECT: {
                    return Object.fromEntries(Array.from(x.data.entries()).map(([k, v]) => [k, convert(v)]));
                }
            }
        };
        return convert(x);
    };
})(serial || (exports.serial = serial = {}));
//# sourceMappingURL=serial.js.map