import { Binary } from "./binary";
import { BinaryBuffer } from "./buffer";
export declare namespace serial {
    const decode: (buff: BinaryBuffer) => Binary;
    const encode: (binary: Binary, out?: BinaryBuffer | null) => BinaryBuffer;
    const toJS: (x: Binary) => unknown;
}
//# sourceMappingURL=serial.d.ts.map