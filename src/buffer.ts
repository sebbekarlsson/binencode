export class BinaryBuffer {
  data: Uint8Array = new Uint8Array(0);
  cursor: number = 0;
  private _saved_cursor: number = 0;

  getView(): DataView {
    return new DataView(this.data.slice(this.cursor).buffer);
  }

  saveCursor(): void {
    this._saved_cursor = this.cursor;
  }

  resetCursor(): void {
    this.cursor = this._saved_cursor;
  }

  setCursor(pos: number) {
    this.cursor = Math.max(0, Math.floor(pos));
  }

  private realloc(newSize: number): void {
    const data = new Uint8Array(newSize);
    if (data.length >= this.data.length) {
      data.set(this.data, 0);
    }
    this.data = data;
  }

  private grow(extraSize: number): void {
    this.realloc(this.data.length + extraSize);
  }

  seek(pos: number): void {
    if (pos === 0) {
      this.cursor = pos;
    } else if (pos < 0) {
      this.cursor = this.data.length - 1;
    } else {
      this.cursor = pos;
    }
  }
  read(size: number): Uint8Array {
    const chunk = this.data.slice(this.cursor, this.cursor + size);
    this.cursor += chunk.length;
    return chunk;
  }

  write(data: ArrayBuffer | BinaryBuffer | Array<number>): void {
    const buffer =
      data instanceof BinaryBuffer ? data.data : new Uint8Array(data);
    if (buffer.length <= 0) return;
    this.grow(buffer.length);
    this.data.set(buffer, this.cursor);
    this.cursor += buffer.length;
  }

  writeByte(x: number): void {
    this.write([x]);
  }
  writeChar(x: string): void {
    const encoder = new TextEncoder();
    const data = encoder.encode(x);
    this.write(data.buffer);
  }
  writeInt32(x: number): void {
    const buff = new ArrayBuffer(4);
    const view = new DataView(buff);
    view.setInt32(0, x);
    this.write(buff);
  }
  writeInt64(x: bigint): void {
    const buff = new ArrayBuffer(8);
    const view = new DataView(buff);
    view.setBigInt64(0, x);
    this.write(buff);
  }
  writeUint32(x: number): void {
    const buff = new ArrayBuffer(4);
    const view = new DataView(buff);
    view.setUint32(0, x);
    this.write(buff);
  }
  writeUint64(x: bigint): void {
    const buff = new ArrayBuffer(8);
    const view = new DataView(buff);
    view.setBigUint64(0, x);
    this.write(buff);
  }
  writeFloat32(x: number): void {
    const buff = new ArrayBuffer(4);
    const view = new DataView(buff);
    view.setFloat32(0, x);
    this.write(buff);
  }
  writeFloat64(x: number): void {
    const buff = new ArrayBuffer(8);
    const view = new DataView(buff);
    view.setFloat64(0, x);
    this.write(buff);
  }

  writeString(x: string): void {
    const encoder = new TextEncoder();
    const data = encoder.encode(x);
    this.write(data.buffer);
  }

  readBytes(size: number): number[] {
    return Array.from(this.read(size).values());
  }

  readByte(): number {
    return new DataView(this.read(1).buffer).getUint8(0);
  }
  readChar(byteCount: number = 1): string {
    const decoder = new TextDecoder();
    return decoder.decode(this.read(byteCount));
  }
  readInt32(): number {
    return new DataView(this.read(4).buffer).getInt32(0);
  }
  readInt64(): bigint {
    return new DataView(this.read(8).buffer).getBigInt64(0);
  }
  readUint32(): number {
    return new DataView(this.read(4).buffer).getUint32(0);
  }
  readUint64(): bigint {
    return new DataView(this.read(8).buffer).getBigUint64(0);
  }
  readFloat32(): number {
    return new DataView(this.read(4).buffer).getFloat32(0);
  }
  readFloat64(): number {
    return new DataView(this.read(8).buffer).getFloat64(0);
  }
  readString(length: number): string {
    const bytes = this.read(length);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  with<R>(fn: (buff: this) => R): R {
    this.saveCursor();
    const r = fn(this);
    this.resetCursor();
    return r;
  }
}
