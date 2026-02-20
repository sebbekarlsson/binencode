import { BinaryBuffer } from "./buffer";
import { has,
isPlainObject } from "./guards";

export const BinSymbol = Symbol("Bin");
export type BinSymbol = typeof BinSymbol;

export enum BinaryComponentType {
  NULL = 0,
  BYTE = 1,
  BOOL = 2,
  CHAR = 3,
  INT32 = 4,
  INT64 = 5,
  UINT32 = 6,
  UINT64 = 7,
  FLOAT32 = 8,
  FLOAT64 = 9,
  BINARY = 10,
}

export enum BinaryType {
  SCALAR = 0,
  ARRAY = 1,
  OBJECT = 2,
}

export type LooseBinary<Data = any> = {
  componentType: number;
  type: number;
  count: number;
  data: Data;
};

export interface BinaryBase<
  ComponentType extends number,
  Type extends BinaryType,
  Data extends any = BinaryBuffer,
> extends LooseBinary<Data> {
  componentType: ComponentType;
  type: Type;
  count: number;
  data: Data;
  bin: BinSymbol;
}

export interface BinaryNull extends BinaryBase<
  BinaryComponentType.NULL,
  BinaryType.SCALAR
> {}
export interface BinaryByte extends BinaryBase<
  BinaryComponentType.BYTE,
  BinaryType.SCALAR
> {}
export interface BinaryBool extends BinaryBase<
  BinaryComponentType.BOOL,
  BinaryType.SCALAR
> {}
export interface BinaryChar extends BinaryBase<
  BinaryComponentType.CHAR,
  BinaryType.SCALAR
> {}
export interface BinaryInt32 extends BinaryBase<
  BinaryComponentType.INT32,
  BinaryType.SCALAR
> {}
export interface BinaryInt64 extends BinaryBase<
  BinaryComponentType.INT64,
  BinaryType.SCALAR
> {}
export interface BinaryUint32 extends BinaryBase<
  BinaryComponentType.UINT32,
  BinaryType.SCALAR
> {}
export interface BinaryUint64 extends BinaryBase<
  BinaryComponentType.UINT64,
  BinaryType.SCALAR
> {}
export interface BinaryFloat32 extends BinaryBase<
  BinaryComponentType.FLOAT32,
  BinaryType.SCALAR
> {}
export interface BinaryFloat64 extends BinaryBase<
  BinaryComponentType.FLOAT64,
  BinaryType.SCALAR
> {}
export interface BinaryArray extends BinaryBase<
  BinaryComponentType.BINARY,
  BinaryType.ARRAY,
  Binary[]
> {}
export interface BinaryObject extends BinaryBase<
  BinaryComponentType.BINARY,
  BinaryType.OBJECT,
  Map<string, Binary>
> {}

export type Binary =
  | BinaryNull
  | BinaryByte
  | BinaryBool
  | BinaryChar
  | BinaryInt32
  | BinaryInt64
  | BinaryUint32
  | BinaryUint64
  | BinaryFloat32
  | BinaryFloat64
  | BinaryArray
  | BinaryObject;


export const isBin = (x: unknown): x is Binary => {
  if (typeof x !== 'object' || x === null) return false;
  return has(x, 'bin') && x.bin === BinSymbol;
}

export namespace bin {
  export const nil = (): BinaryNull => ({
    componentType: BinaryComponentType.NULL,
    type: BinaryType.SCALAR,
    count: 0,
    data: new BinaryBuffer(),
    bin: BinSymbol
  });

  export const int32 = (value: number): BinaryInt32 => ({
    componentType: BinaryComponentType.INT32,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeInt32(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const int64 = (value: bigint): BinaryInt64 => ({
    componentType: BinaryComponentType.INT64,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeInt64(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const uint32 = (value: number): BinaryUint32 => ({
    componentType: BinaryComponentType.UINT32,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeUint32(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const uint64 = (value: bigint): BinaryUint64 => ({
    componentType: BinaryComponentType.UINT64,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeUint64(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const float32 = (value: number): BinaryFloat32 => ({
    componentType: BinaryComponentType.FLOAT32,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeFloat32(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const float64 = (value: number): BinaryFloat64 => ({
    componentType: BinaryComponentType.FLOAT64,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeFloat64(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const byte = (value: number): BinaryByte => ({
    componentType: BinaryComponentType.BYTE,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeByte(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const bool = (value: boolean): BinaryBool => ({
    componentType: BinaryComponentType.BOOL,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeByte(Number(value));
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const char = (value: string): BinaryChar => ({
    componentType: BinaryComponentType.CHAR,
    type: BinaryType.SCALAR,
    count: 1,
    data: (() => {
      const buff = new BinaryBuffer();
      buff.writeChar(value);
      buff.setCursor(0);
      return buff;
    })(),
    bin: BinSymbol
  });

  export const string = (value: string): BinaryArray => ({
    componentType: BinaryComponentType.BINARY,
    type: BinaryType.ARRAY,
    count: value.length,
    data: Array.from(value).map((x) => char(x)),
    bin: BinSymbol
  });

  export const array = (...args: Binary[]): BinaryArray => ({
    componentType: BinaryComponentType.BINARY,
    type: BinaryType.ARRAY,
    count: args.length,
    data: args,
    bin: BinSymbol
  });

  export const object = (
    data: Record<string, Binary> | Map<string, Binary>,
  ): BinaryObject => {
    return {
      componentType: BinaryComponentType.BINARY,
      type: BinaryType.OBJECT,
      count: data instanceof Map ? data.size : Object.entries(data).length,
      data: data instanceof Map ? data : new Map(Object.entries(data)),
      bin: BinSymbol
    };
  };

  export function auto(x: unknown): Binary {
    if (typeof x === "undefined" || x === null) return nil();
    if (isBin(x)) return x;
    if (Array.isArray(x)) {
      return array(...x.map((v) => auto(v)));
    }
    switch (typeof x) {
      case "number": {
        if (Number.isInteger(x)) return int32(x);
        return float32(x);
      }
      case "string":
        return string(x);
      case "boolean":
        return bool(x);
      case "symbol":
        return string(x.toString());
      case "undefined":
        return nil();
      case "bigint":
        return int64(x);
      case "function":
        return nil();
      case "object": {
        if (!isPlainObject(x)) return nil();
        const m = new Map<string, Binary>();
        for (const [k, v] of Object.entries(x)) {
          m.set(k, auto(v));
        }
        return object(m);
      }
    }
    return nil();
  }
}
