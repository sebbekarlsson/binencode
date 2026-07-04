import { bin, BinaryComponentType, BinaryType } from "./binary";
import { BinaryBuffer } from "./buffer";
export var serial;
(function (serial) {
    serial.decode = (buff) => {
        const bintype = buff.readInt32();
        const comptype = buff.readInt32();
        const count = buff.readInt32();
        switch (bintype) {
            case BinaryType.STRING: {
                if (count <= 0)
                    return bin.string("");
                return bin.string(buff.readString(count));
            }
            case BinaryType.SCALAR: {
                if (count <= 0)
                    return bin.nil();
                switch (comptype) {
                    case BinaryComponentType.BYTE:
                        return bin.byte(buff.readByte());
                    case BinaryComponentType.BOOL:
                        return bin.bool(!!buff.readByte());
                    case BinaryComponentType.CHAR:
                        return bin.char(buff.readChar(count));
                    case BinaryComponentType.INT32:
                        return bin.int32(buff.readInt32());
                    case BinaryComponentType.UINT32:
                        return bin.uint32(buff.readUint32());
                    case BinaryComponentType.INT64:
                        return bin.int64(buff.readInt64());
                    case BinaryComponentType.UINT64:
                        return bin.uint64(buff.readUint64());
                    case BinaryComponentType.FLOAT32:
                        return bin.float32(buff.readFloat32());
                    case BinaryComponentType.FLOAT64:
                        return bin.float64(buff.readFloat64());
                    case BinaryComponentType.NULL:
                        return bin.nil();
                    case BinaryComponentType.BINARY:
                        return bin.array(serial.decode(buff));
                    default:
                        throw new Error("not reached");
                }
            }
            case BinaryType.ARRAY: {
                const items = [];
                for (let i = 0; i < count; i++) {
                    const item = serial.decode(buff);
                    items.push(item);
                }
                return bin.array(...items);
            }
            case BinaryType.OBJECT: {
                const m = new Map();
                for (let i = 0; i < count; i++) {
                    const k = serial.decode(buff);
                    if (k.type !== BinaryType.STRING)
                        throw new Error("Expected string");
                    k.data.saveCursor();
                    const ks = k.data.readString(k.count);
                    k.data.resetCursor();
                    const v = serial.decode(buff);
                    m.set(ks, v);
                }
                return bin.object(m);
            }
            default:
                throw new Error(`not reached ${bintype}`);
        }
    };
    serial.encode = (binary, out = null) => {
        const buff = out || new BinaryBuffer();
        buff.saveCursor();
        const enc = (binary) => {
            buff.writeInt32(binary.type);
            buff.writeInt32(binary.componentType);
            buff.writeInt32(binary.count);
            switch (binary.type) {
                case BinaryType.STRING: {
                    buff.write(binary.data);
                    return buff;
                }
                case BinaryType.SCALAR: {
                    switch (binary.componentType) {
                        case BinaryComponentType.NULL:
                            return buff;
                        case BinaryComponentType.CHAR:
                        case BinaryComponentType.INT32:
                        case BinaryComponentType.UINT32:
                        case BinaryComponentType.INT64:
                        case BinaryComponentType.UINT64:
                        case BinaryComponentType.FLOAT32:
                        case BinaryComponentType.FLOAT64:
                        case BinaryComponentType.BOOL:
                        case BinaryComponentType.BYTE: {
                            buff.write(binary.data);
                            return buff;
                        }
                    }
                }
                case BinaryType.ARRAY: {
                    for (const b of binary.data) {
                        enc(b);
                    }
                    return buff;
                }
                case BinaryType.OBJECT: {
                    binary.data.forEach((b, k) => {
                        enc(bin.string(k));
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
                case BinaryType.STRING: {
                    return x.data.with((buff) => buff.readString(x.count));
                }
                case BinaryType.SCALAR: {
                    switch (x.componentType) {
                        case BinaryComponentType.BYTE:
                            return x.data.with((buff) => buff.readByte());
                        case BinaryComponentType.BOOL:
                            return x.data.with((buff) => !!buff.readByte());
                        case BinaryComponentType.CHAR:
                            return x.data.with((buff) => buff.readChar());
                        case BinaryComponentType.INT32:
                            return x.data.with((buff) => buff.readInt32());
                        case BinaryComponentType.UINT32:
                            return x.data.with((buff) => buff.readUint32());
                        case BinaryComponentType.INT64:
                            return x.data.with((buff) => buff.readInt64());
                        case BinaryComponentType.UINT64:
                            return x.data.with((buff) => buff.readUint64());
                        case BinaryComponentType.FLOAT32:
                            return x.data.with((buff) => buff.readFloat32());
                        case BinaryComponentType.FLOAT64:
                            return x.data.with((buff) => buff.readFloat64());
                        case BinaryComponentType.NULL:
                            return null;
                        default:
                            throw new Error("Not reached");
                    }
                }
                case BinaryType.ARRAY: {
                    return x.data.map((v) => convert(v));
                }
                case BinaryType.OBJECT: {
                    return Object.fromEntries(Array.from(x.data.entries()).map(([k, v]) => [k, convert(v)]));
                }
            }
        };
        return convert(x);
    };
})(serial || (serial = {}));
//# sourceMappingURL=serial.js.map