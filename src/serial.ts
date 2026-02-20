import { bin, Binary, BinaryComponentType, BinaryType } from "./binary";
import { BinaryBuffer } from "./buffer";

export namespace serial {
  export const decode = (buff: BinaryBuffer): Binary => {
    const bintype = buff.readInt32() as BinaryType;
    const comptype = buff.readInt32() as BinaryComponentType;
    const count = buff.readInt32();

    switch (bintype) {
      case BinaryType.SCALAR: {
        if (count <= 0) return bin.nil();
        switch (comptype) {
          case BinaryComponentType.BYTE:
            return bin.byte(buff.readByte());
          case BinaryComponentType.BOOL:
            return bin.bool(!!buff.readByte());
          case BinaryComponentType.CHAR:
            return bin.char(buff.readChar());
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
            return bin.array(decode(buff));
        }
      }
      case BinaryType.ARRAY: {
        const items: Binary[] = [];

        for (let i = 0; i < count; i++) {
          const item = decode(buff);
          items.push(item);
        }
        return bin.array(...items);
      }
      case BinaryType.OBJECT: {
        const m = new Map<string, Binary>();
        for (let i = 0; i < count; i++) {
          const k = decode(buff);
          if (k.componentType !== BinaryComponentType.BINARY)
            throw new Error("Expected binary");
          if (k.type !== BinaryType.ARRAY) throw new Error("Expected array");
          if (
            !k.data.every((x) => x.componentType === BinaryComponentType.CHAR)
          )
            throw new Error("Expected array of chars");
          if (!k.data.every((x) => x.type === BinaryType.SCALAR))
            throw new Error("Expected array of char scalars");
          const kbuff = new BinaryBuffer();
          kbuff.saveCursor();
          for (const kx of k.data) {
            kbuff.write(kx.data);
          }
          kbuff.resetCursor();
          const ks = kbuff.readString(k.data.length);
          const v = decode(buff);
          m.set(ks, v);
        }
        return bin.object(m);
      }
    }
  };

  export const encode = (
    binary: Binary,
    out: BinaryBuffer | null = null,
  ): BinaryBuffer => {
    const buff = out || new BinaryBuffer();
    buff.saveCursor();

    const enc = (binary: Binary): BinaryBuffer => {
      buff.writeInt32(binary.type);
      buff.writeInt32(binary.componentType);
      buff.writeInt32(binary.count);

      switch (binary.type) {
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
          binary.data.forEach((b: Binary, k: string) => {
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

  export const toJS = (x: Binary): unknown => {
    const convert = (x: Binary): unknown => {
      switch (x.type) {
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
            //case BinaryComponentType.BINARY: return convert(x)
          }
        }
        case BinaryType.ARRAY: {
          if (
            x.data.every((x) => x.componentType === BinaryComponentType.CHAR)
          ) {
            const buff = new BinaryBuffer();
            buff.saveCursor();
            for (const item of x.data) {
              buff.write(item.data);
            }
            buff.resetCursor();
            const str = buff.readString(x.data.length);
            return str;
          }
          return x.data.map((v) => convert(v));
        };
        case BinaryType.OBJECT: {
          return Object.fromEntries(Array.from(x.data.entries()).map(([k, v]) => [
            k,
            convert(v)
          ]))
        };
      }
    };
    return convert(x);
  };
}
