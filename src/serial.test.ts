import { bin } from './binary';
import { serial } from './serial';
import { describe, assert } from 'vitest';

type Test = {
  description: string;
  input: any;
};


const TESTS: Test[] = [
  {
    description: 'string',
    input: "foo"
  },
  {
    description: 'number',
    input: 5
  }
];


describe('serial', (it) => {
  TESTS.forEach((test) => {
    it(`[${test.description}]: produces the same output as the input`, () => {
      const binary = bin.auto(test.input);
      const encoded = serial.encode(binary);
      const decoded = serial.decode(encoded);
      const js = serial.toJS(decoded);
      assert.deepEqual(test.input, js);
    })
  })
});
