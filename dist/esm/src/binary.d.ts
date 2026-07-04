import { BinaryBuffer } from "./buffer";
export declare const BinSymbol: unique symbol;
export type BinSymbol = typeof BinSymbol;
export declare enum BinaryComponentType {
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
    BINARY = 10
}
export declare enum BinaryType {
    SCALAR = 0,
    ARRAY = 1,
    OBJECT = 2,
    STRING = 3
}
export type LooseBinary<Data = any> = {
    componentType: number;
    type: number;
    count: number;
    data: Data;
};
export interface BinaryBase<ComponentType extends number, Type extends BinaryType, Data extends any = BinaryBuffer> extends LooseBinary<Data> {
    componentType: ComponentType;
    type: Type;
    count: number;
    data: Data;
    bin: BinSymbol;
}
export interface BinaryNull extends BinaryBase<BinaryComponentType.NULL, BinaryType.SCALAR> {
}
export interface BinaryByte extends BinaryBase<BinaryComponentType.BYTE, BinaryType.SCALAR> {
}
export interface BinaryBool extends BinaryBase<BinaryComponentType.BOOL, BinaryType.SCALAR> {
}
export interface BinaryChar extends BinaryBase<BinaryComponentType.CHAR, BinaryType.SCALAR> {
}
export interface BinaryInt32 extends BinaryBase<BinaryComponentType.INT32, BinaryType.SCALAR> {
}
export interface BinaryInt64 extends BinaryBase<BinaryComponentType.INT64, BinaryType.SCALAR> {
}
export interface BinaryUint32 extends BinaryBase<BinaryComponentType.UINT32, BinaryType.SCALAR> {
}
export interface BinaryUint64 extends BinaryBase<BinaryComponentType.UINT64, BinaryType.SCALAR> {
}
export interface BinaryFloat32 extends BinaryBase<BinaryComponentType.FLOAT32, BinaryType.SCALAR> {
}
export interface BinaryFloat64 extends BinaryBase<BinaryComponentType.FLOAT64, BinaryType.SCALAR> {
}
export interface BinaryArray extends BinaryBase<BinaryComponentType.BINARY, BinaryType.ARRAY, Binary[]> {
}
export interface BinaryObject extends BinaryBase<BinaryComponentType.BINARY, BinaryType.OBJECT, Map<string, Binary>> {
}
export interface BinaryString extends BinaryBase<BinaryComponentType.CHAR, BinaryType.STRING> {
}
export type Binary = BinaryNull | BinaryByte | BinaryBool | BinaryChar | BinaryInt32 | BinaryInt64 | BinaryUint32 | BinaryUint64 | BinaryFloat32 | BinaryFloat64 | BinaryArray | BinaryObject | BinaryString;
export declare const isBin: (x: unknown) => x is Binary;
export declare namespace bin {
    const nil: () => BinaryNull;
    const int32: (value: number) => BinaryInt32;
    const int64: (value: bigint) => BinaryInt64;
    const uint32: (value: number) => BinaryUint32;
    const uint64: (value: bigint) => BinaryUint64;
    const float32: (value: number) => BinaryFloat32;
    const float64: (value: number) => BinaryFloat64;
    const byte: (value: number) => BinaryByte;
    const bool: (value: boolean) => BinaryBool;
    const char: (value: string) => BinaryChar;
    const string: (value: string) => BinaryString;
    const array: (...args: Binary[]) => BinaryArray;
    const object: (data: Record<string, Binary> | Map<string, Binary>) => BinaryObject;
    function auto(x: unknown): Binary;
}
//# sourceMappingURL=binary.d.ts.map