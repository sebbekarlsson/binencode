export type LooseSchema = {
  type: string;
  _phantom: {
    out: any;
  }
}

export type InferSchema<T> =
  [T] extends [LooseSchema] ? T['_phantom']['out'] : never


export interface SchemaBase<Type extends string> extends LooseSchema {
  type: Type;
}

export interface SchemaByte extends SchemaBase<'byte'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaInt32 extends SchemaBase<'int32'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaInt64 extends SchemaBase<'int64'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaUint32 extends SchemaBase<'uint32'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaUint64 extends SchemaBase<'uint64'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaFloat32 extends SchemaBase<'float32'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaFloat64 extends SchemaBase<'float64'> {
  _phantom: {
    out: number;
  }
}
export interface SchemaBuffer extends SchemaBase<'float64'> {
  _phantom: {
    out: number[];
  }
}


export type Schema =
  | SchemaByte
  | SchemaInt32
  | SchemaInt64
  | SchemaUint32
  | SchemaUint64
  | SchemaFloat32
  | SchemaFloat64
  | SchemaBuffer
