import { assert, expect } from 'chai';
import { test } from 'mocha';
import path from 'path';
import { addToBasename } from '../src/artwork-util';

test('my test', () => {
  const x = 1;
  assert.equal(x, 1);
  const s = 'Hello  this is   a test';
  const array = s.split(/\W+/);
  assert.equal(array.length, 5);
});

test('base-ext and dir', () => {
  const filePath = '/Users/tonibuenter/_proj/misc/arweave-tools/local/icon.png';
  const filePath2 = '/Users/tonibuenter/_proj/misc/arweave-tools/local/icon-enc.png';
  let dirname = path.dirname(filePath);
  let basename = path.basename(filePath);
  let extname = path.extname(filePath);
  basename = basename.substring(0, basename.length - extname.length);
  const fileEncPath = path.format({ root: dirname + '/', name: basename, ext: extname });
  expect(fileEncPath).equal(filePath);
  const f2 = addToBasename(filePath, '');
  expect(f2).equal(filePath);
  const f3 = addToBasename(filePath, '-enc');
  expect(f3).equal(filePath2);
});
