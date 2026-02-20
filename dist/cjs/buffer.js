"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryBuffer = void 0;
class BinaryBuffer {
    data = new Uint8Array(0);
    cursor = 0;
    _saved_cursor = 0;
    getView() {
        return new DataView(this.data.slice(this.cursor).buffer);
    }
    saveCursor() {
        this._saved_cursor = this.cursor;
    }
    resetCursor() {
        this.cursor = this._saved_cursor;
    }
    setCursor(pos) {
        this.cursor = Math.max(0, Math.floor(pos));
    }
    realloc(newSize) {
        const data = new Uint8Array(newSize);
        if (data.length >= this.data.length) {
            data.set(this.data, 0);
        }
        this.data = data;
    }
    grow(extraSize) {
        this.realloc(this.data.length + extraSize);
    }
    seek(pos) {
        if (pos === 0) {
            this.cursor = pos;
        }
        else if (pos < 0) {
            this.cursor = this.data.length - 1;
        }
        else {
            this.cursor = pos;
        }
    }
    read(size) {
        const chunk = this.data.slice(this.cursor, this.cursor + size);
        this.cursor += chunk.length;
        return chunk;
    }
    write(data) {
        const buffer = data instanceof BinaryBuffer ? data.data : new Uint8Array(data);
        if (buffer.length <= 0)
            return;
        this.grow(buffer.length);
        this.data.set(buffer, this.cursor);
        this.cursor += buffer.length;
    }
    writeByte(x) {
        this.write([x]);
    }
    writeChar(x) {
        const encoder = new TextEncoder();
        const data = encoder.encode(x);
        this.write(data.buffer);
    }
    writeInt32(x) {
        const buff = new ArrayBuffer(4);
        const view = new DataView(buff);
        view.setInt32(0, x);
        this.write(buff);
    }
    writeInt64(x) {
        const buff = new ArrayBuffer(8);
        const view = new DataView(buff);
        view.setBigInt64(0, x);
        this.write(buff);
    }
    writeUint32(x) {
        const buff = new ArrayBuffer(4);
        const view = new DataView(buff);
        view.setUint32(0, x);
        this.write(buff);
    }
    writeUint64(x) {
        const buff = new ArrayBuffer(8);
        const view = new DataView(buff);
        view.setBigUint64(0, x);
        this.write(buff);
    }
    writeFloat32(x) {
        const buff = new ArrayBuffer(4);
        const view = new DataView(buff);
        view.setFloat32(0, x);
        this.write(buff);
    }
    writeFloat64(x) {
        const buff = new ArrayBuffer(8);
        const view = new DataView(buff);
        view.setFloat64(0, x);
        this.write(buff);
    }
    writeString(x) {
        const encoder = new TextEncoder();
        const data = encoder.encode(x);
        this.write(data.buffer);
    }
    readBytes(size) {
        return Array.from(this.read(size).values());
    }
    readByte() {
        return new DataView(this.read(1).buffer).getUint8(0);
    }
    readChar(byteCount = 1) {
        const decoder = new TextDecoder();
        return decoder.decode(this.read(byteCount));
    }
    readInt32() {
        return new DataView(this.read(4).buffer).getInt32(0);
    }
    readInt64() {
        return new DataView(this.read(8).buffer).getBigInt64(0);
    }
    readUint32() {
        return new DataView(this.read(4).buffer).getUint32(0);
    }
    readUint64() {
        return new DataView(this.read(8).buffer).getBigUint64(0);
    }
    readFloat32() {
        return new DataView(this.read(4).buffer).getFloat32(0);
    }
    readFloat64() {
        return new DataView(this.read(8).buffer).getFloat64(0);
    }
    readString(length) {
        const bytes = this.read(length);
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }
    with(fn) {
        this.saveCursor();
        const r = fn(this);
        this.resetCursor();
        return r;
    }
}
exports.BinaryBuffer = BinaryBuffer;
//# sourceMappingURL=buffer.js.map