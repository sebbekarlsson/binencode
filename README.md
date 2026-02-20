# binencode

TypeScript library for encoding and decoding structured binary data. Supports scalars, strings, arrays, objects, and arbitrary nesting — all serialized to a compact big-endian binary wire format.

## Installation

```bash
npm install binencode
# or
pnpm add binencode
```

## Quick Start

```ts
import { bin, serial } from "binencode";

// 1. Create a Binary value
const value = bin.auto({ name: "Alice", score: 42, tags: ["admin", "user"] });

// 2. Encode to bytes
const buffer = serial.encode(value);

// 3. Decode back
const decoded = serial.decode(buffer);

// 4. Convert to plain JS
const js = serial.toJS(decoded);
// => { name: "Alice", score: 42, tags: ["admin", "user"] }
```

## Core Concepts

All values in binencode are represented as `Binary` objects — typed wrappers around raw byte buffers. The `bin` namespace provides constructors, `serial` handles encode/decode, and `BinaryBuffer` is the underlying growable byte buffer.

---

## Creating Binary Values

### `bin.auto(value)` — automatic conversion

Converts any plain JS value to the appropriate `Binary` type:

```ts
bin.auto(null)           // => BinaryNull
bin.auto(true)           // => BinaryBool
bin.auto(42)             // => BinaryInt32
bin.auto(3.14)           // => BinaryFloat32
bin.auto(42n)            // => BinaryInt64
bin.auto("hello")        // => BinaryString
bin.auto([1, 2, 3])      // => BinaryArray
bin.auto({ x: 1 })       // => BinaryObject
```

| JS type     | Binary type    |
|-------------|----------------|
| `null`/`undefined` | `BinaryNull` |
| `boolean`   | `BinaryBool`   |
| integer     | `BinaryInt32`  |
| float       | `BinaryFloat32`|
| `bigint`    | `BinaryInt64`  |
| `string`    | `BinaryString` |
| `Array`     | `BinaryArray`  |
| plain object | `BinaryObject` |

### Explicit constructors

Use these when you need precise control over the numeric type:

```ts
bin.nil()                // null
bin.bool(true)           // boolean
bin.byte(0xff)           // unsigned 8-bit integer
bin.int32(-100)          // signed 32-bit integer
bin.uint32(4294967295)   // unsigned 32-bit integer
bin.int64(-9007199254740993n)  // signed 64-bit integer (bigint)
bin.uint64(18446744073709551615n) // unsigned 64-bit integer (bigint)
bin.float32(3.14)        // 32-bit float
bin.float64(3.141592653589793) // 64-bit float
bin.string("hello 🌍")  // UTF-8 string (supports emoji)
bin.char("A")            // single character scalar
```

### Collections

```ts
// Array — heterogeneous elements are fine
bin.array(
  bin.int32(1),
  bin.string("two"),
  bin.nil(),
)

// Object — from a plain record or a Map
bin.object({ x: bin.int32(10), y: bin.float32(3.14) })

bin.object(new Map([
  ["key", bin.string("value")],
]))
```

---

## Serialization

### `serial.encode(binary, out?)`

Serializes a `Binary` value into a `BinaryBuffer`. Optionally appends into an existing buffer.

```ts
import { bin, serial } from "binencode";

const encoded = serial.encode(bin.auto({ id: 1, name: "Alice" }));
// encoded.data is a Uint8Array
```

### `serial.decode(buffer)`

Deserializes a `BinaryBuffer` back into a `Binary` value.

```ts
const decoded = serial.decode(encoded);
```

### `serial.toJS(binary)`

Converts a `Binary` back to a plain JavaScript value.

```ts
serial.toJS(bin.int32(42))          // => 42
serial.toJS(bin.string("hi"))       // => "hi"
serial.toJS(bin.array(bin.int32(1), bin.int32(2))) // => [1, 2]
serial.toJS(bin.object({ a: bin.bool(true) }))     // => { a: true }
```

---

## Examples

### Round-trip a primitive

```ts
import { bin, serial } from "binencode";

const original = bin.float64(Math.PI);
const buffer = serial.encode(original);
const result = serial.toJS(serial.decode(buffer));
// => 3.141592653589793
```

### Round-trip a nested structure

```ts
const data = bin.auto({
  config: {
    host: "localhost",
    port: 8080,
    tags: ["primary", "read-only"],
  },
  count: 2,
});

const encoded = serial.encode(data);
const decoded = serial.toJS(serial.decode(encoded));
// => { config: { host: "localhost", port: 8080, tags: ["primary", "read-only"] }, count: 2 }
```

### Append to an existing buffer

```ts
import { BinaryBuffer, bin, serial } from "binencode";

const out = new BinaryBuffer();
serial.encode(bin.int32(1), out);
serial.encode(bin.string("hello"), out);
// Both values are now packed into `out`
```

### Check if a value is Binary

```ts
import { bin, isBin } from "binencode";

isBin(bin.int32(5))  // => true
isBin(42)            // => false
isBin({})            // => false
```

---

## Wire Format

Each value is encoded as:

```
[type: i32][componentType: i32][count: i32][data...]
```

All integers are big-endian. Arrays and objects encode their children recursively. Object keys are encoded as strings before each value.

---

## API Reference

### `bin` namespace

| Function | Description |
|---|---|
| `bin.auto(x)` | Converts any JS value to `Binary` |
| `bin.nil()` | Null value |
| `bin.bool(v)` | Boolean |
| `bin.byte(v)` | Unsigned 8-bit integer |
| `bin.int32(v)` | Signed 32-bit integer |
| `bin.uint32(v)` | Unsigned 32-bit integer |
| `bin.int64(v)` | Signed 64-bit integer (`bigint`) |
| `bin.uint64(v)` | Unsigned 64-bit integer (`bigint`) |
| `bin.float32(v)` | 32-bit float |
| `bin.float64(v)` | 64-bit float |
| `bin.char(v)` | Single character scalar |
| `bin.string(v)` | UTF-8 string |
| `bin.array(...items)` | Heterogeneous array of `Binary` |
| `bin.object(record \| map)` | Key-value object |

### `serial` namespace

| Function | Description |
|---|---|
| `serial.encode(binary, out?)` | Encode a `Binary` to a `BinaryBuffer` |
| `serial.decode(buffer)` | Decode a `BinaryBuffer` to a `Binary` |
| `serial.toJS(binary)` | Convert a `Binary` to a plain JS value |

### `isBin(x)`

Type guard — returns `true` if `x` is a branded `Binary` value.

### `BinaryBuffer`

Low-level growable byte buffer used internally. Useful if you need direct byte access or want to manage a shared output buffer.

```ts
import { BinaryBuffer } from "binencode";

const buf = new BinaryBuffer();
buf.writeInt32(42);
buf.setCursor(0);
buf.readInt32(); // => 42
```
