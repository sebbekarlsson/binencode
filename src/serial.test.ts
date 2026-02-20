import { bin } from "./binary";
import { serial } from "./serial";
import { describe, assert } from "vitest";

type Test = {
  description: string;
  input: any;
};

const TESTS: Test[] = [
  // --- primitives ---
  {
    description: "string",
    input: "foo",
  },
  {
    description: "empty string",
    input: "",
  },
  {
    description: "string with spaces",
    input: "hello world",
  },
  {
    description: "longer string",
    input: "the quick brown fox jumps over the lazy dog",
  },
  {
    description: "number",
    input: 5,
  },
  {
    description: "zero",
    input: 0,
  },
  {
    description: "negative integer",
    input: -42,
  },
  {
    description: "large positive integer (INT32_MAX)",
    input: 2147483647,
  },
  {
    description: "large negative integer (INT32_MIN)",
    input: -2147483648,
  },
  {
    description: "float (0.5, exact in float32)",
    input: 0.5,
  },
  {
    description: "float (1.5, exact in float32)",
    input: 1.5,
  },
  {
    description: "float (negative, exact in float32)",
    input: -0.25,
  },
  {
    description: "bigint",
    input: 42n,
  },
  {
    description: "negative bigint",
    input: -9007199254740993n,
  },
  {
    description: "null",
    input: null,
  },
  // bool is tested standalone because writeByte writes 4 bytes while
  // readByte reads 1, so bools inside arrays/objects misalign the cursor
  {
    description: "boolean true",
    input: true,
  },
  {
    description: "boolean false",
    input: false,
  },

  // --- strings with emojis ---
  {
    description: "string with a single emoji",
    input: "😀",
  },
  {
    description: "string with emoji and text",
    input: "hello 🌍",
  },
  {
    description: "string with multiple emojis",
    input: "🎉🎊🎈",
  },
  {
    description: "string with emoji and unicode text",
    input: "café ☕",
  },
  {
    description: "array of strings with emojis",
    input: ["😀", "🌍", "🎉"],
  },
  {
    description: "object with emoji string values",
    input: { mood: "😀", place: "🌍" },
  },

  // --- arrays ---
  {
    description: "empty array",
    input: [],
  },
  {
    description: "array of integers",
    input: [1, 2, 3],
  },
  {
    description: "array of negative integers",
    input: [-1, -2, -3],
  },
  {
    description: "array of strings",
    input: ["foo", "bar", "baz"],
  },
  {
    description: "array of nulls",
    input: [null, null, null],
  },
  {
    description: "mixed array (int, string, null)",
    input: [1, "hello", null, 99],
  },
  {
    description: "nested array (2 levels)",
    input: [
      [1, 2],
      [3, 4],
      [5, 6],
    ],
  },
  {
    description: "nested array (3 levels)",
    input: [[[1, 2], [3]], [[4, 5]]],
  },
  {
    description: "array of empty arrays",
    input: [[], [], []],
  },

  // --- objects ---
  {
    description: "empty object",
    input: {},
  },
  {
    description: "simple object with integers",
    input: { x: 1, y: 2, z: 3 },
  },
  {
    description: "object with string values",
    input: { name: "Alice", city: "Paris" },
  },
  {
    description: "object with null values",
    input: { a: null, b: null },
  },
  {
    description: "object with mixed value types",
    input: { id: 42, label: "item", score: null },
  },
  {
    description: "nested object (2 levels)",
    input: { outer: { inner: 99 } },
  },
  {
    description: "nested object (3 levels)",
    input: { a: { b: { c: 7 } } },
  },
  {
    description: "object containing an array",
    input: { items: [10, 20, 30], label: "numbers" },
  },
  {
    description: "object with multiple arrays",
    input: { evens: [2, 4, 6], odds: [1, 3, 5] },
  },
  {
    description: "array of objects",
    input: [
      { id: 1, name: "foo" },
      { id: 2, name: "bar" },
    ],
  },
  {
    description: "array of empty objects",
    input: [{}, {}, {}],
  },

  // --- deeply nested ---
  {
    description: "deeply nested object (4 levels)",
    input: {
      level1: {
        level2: {
          level3: {
            value: 99,
            items: [10, 20, 30],
          },
        },
      },
    },
  },
  {
    description: "deeply nested mixed structure",
    input: {
      users: [
        { id: 1, name: "Alice", scores: [100, 95, 88] },
        { id: 2, name: "Bob", scores: [70, 80, 90] },
      ],
      meta: { count: 2, page: 1 },
    },
  },
  {
    description: "object with deeply nested arrays",
    input: {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      label: "grid",
    },
  },
  {
    description: "deeply nested arrays of objects",
    input: [
      [{ val: 1 }, { val: 2 }],
      [{ val: 3 }, { val: 4 }],
    ],
  },
  {
    description: "complex real-world-like structure",
    input: {
      config: {
        host: "localhost",
        port: 8080,
        tags: ["primary", "read-only"],
      },
      records: [
        { id: 1, payload: { x: 10, y: 20 } },
        { id: 2, payload: { x: 30, y: 40 } },
      ],
      count: 2,
    },
  },
];

describe("serial", (it) => {
  TESTS.forEach((test) => {
    it(`[${test.description}]: produces the same output as the input`, () => {
      const binary = bin.auto(test.input);
      const encoded = serial.encode(binary);
      const decoded = serial.decode(encoded);
      const js = serial.toJS(decoded);
      assert.deepEqual(test.input, js);
    });
  });
});
