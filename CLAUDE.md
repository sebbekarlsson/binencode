# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # Compile TypeScript to ./dist (excludes test files)
pnpm test           # Run all tests with vitest (watch mode)
pnpm vitest run     # Run tests once (CI mode)
pnpm vitest run src/serial.test.ts   # Run a single test file
```

## Architecture

This is a TypeScript library for encoding/decoding structured binary data. All public API is re-exported from `src/index.ts`.

### Core Modules

**`src/binary.ts`** — The central type system and value constructors.
- `BinaryComponentType` enum: the primitive types (NULL, BYTE, BOOL, CHAR, INT32, INT64, UINT32, UINT64, FLOAT32, FLOAT64, BINARY)
- `BinaryType` enum: the structure kind (SCALAR, ARRAY, OBJECT)
- `Binary` union type: all concrete binary value types (e.g. `BinaryInt32`, `BinaryArray`, `BinaryObject`)
- `bin` namespace: factory functions to create `Binary` values (`bin.int32`, `bin.string`, `bin.array`, `bin.object`, `bin.auto`, etc.)
- `BinSymbol`: a `Symbol` used as a brand on all `Binary` objects; `isBin()` checks for it
- Strings are represented as `BinaryArray` of `BinaryChar` scalars; plain arrays/objects use `BinaryArray`/`BinaryObject` with `componentType = BINARY`

**`src/buffer.ts`** — Low-level growable byte buffer.
- `BinaryBuffer` class wraps a `Uint8Array` with a cursor, auto-growing on write
- `saveCursor()`/`resetCursor()` for save/restore; `with(fn)` runs a function and restores the cursor afterward
- Read/write methods for all primitive types using `DataView` (big-endian by default)

**`src/serial.ts`** — Serialization/deserialization and JS conversion.
- `serial.encode(binary, out?)`: serializes a `Binary` into a `BinaryBuffer`. Wire format per value: `[type: i32][componentType: i32][count: i32][data...]` recursively
- `serial.decode(buff)`: deserializes from a `BinaryBuffer` back to a `Binary`
- `serial.toJS(binary)`: converts a `Binary` back to a plain JS value (char arrays → strings, objects → plain objects, scalars → primitives)

**`src/guards.ts`** — Type guard utilities (`has`, `isPlainObject`) used internally.

### TypeScript Config Notes

- Path alias `@bintool/*` maps to `./src/*`
- Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled
- `isolatedModules: true` — avoid type-only imports without `import type`
- Test files (`*.test.ts`) are excluded from the build but included by vitest
