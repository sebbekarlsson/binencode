export declare class BinaryBuffer {
    data: Uint8Array;
    cursor: number;
    private _saved_cursor;
    getView(): DataView;
    saveCursor(): void;
    resetCursor(): void;
    setCursor(pos: number): void;
    private realloc;
    private grow;
    seek(pos: number): void;
    read(size: number): Uint8Array;
    write(data: ArrayBuffer | BinaryBuffer | Array<number>): void;
    writeByte(x: number): void;
    writeChar(x: string): void;
    writeInt32(x: number): void;
    writeInt64(x: bigint): void;
    writeUint32(x: number): void;
    writeUint64(x: bigint): void;
    writeFloat32(x: number): void;
    writeFloat64(x: number): void;
    writeString(x: string): void;
    readBytes(size: number): number[];
    readByte(): number;
    readChar(byteCount?: number): string;
    readInt32(): number;
    readInt64(): bigint;
    readUint32(): number;
    readUint64(): bigint;
    readFloat32(): number;
    readFloat64(): number;
    readString(length: number): string;
    with<R>(fn: (buff: this) => R): R;
}
//# sourceMappingURL=buffer.d.ts.map