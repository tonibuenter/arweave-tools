import { expect } from 'chai';
import fs from 'fs';
import {decrypt, encrypt, newKeyPairPlus} from "../src/artwork-util";

describe('artwork cli test', () => {
  it('test artwork cli 01', () => {

    process.argv = ['node', 'test.js', 'dryrun'];


    const keyPair = newKeyPairPlus();
    const buffer = fs.readFileSync('data/mythen.jpg');
    const data = new Uint8Array(buffer);

    const dataEnc = encrypt(keyPair, data);
    expect(dataEnc).to.not.be.null;
    const data1 = decrypt(keyPair, dataEnc);

    expect(data1).eql(data);

    // just to be sure eql is doing what it is expected
    expect(new Uint8Array([21, 31])).eql(new Uint8Array([21, 31]));
    expect(new Uint8Array([21, 31])).not.equals(new Uint8Array([21, 31]));
    expect(new Uint8Array([20, 31])).not.eql(new Uint8Array([21, 31]));
  });
});
