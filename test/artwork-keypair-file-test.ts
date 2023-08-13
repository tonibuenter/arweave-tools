import { expect } from 'chai';
import fs from 'fs-extra';
import { newKeyPairPlus, readKeyPairFile, writeKeyPairFile } from '../src/artwork-util';

describe('artwork keypair file', () => {
  it('test write and read a keypair file 01', () => {
    const path = './tmp/keyPair.json';

    const keyPair = newKeyPairPlus();

    writeKeyPairFile(keyPair, path);
    const keypair1 = readKeyPairFile(path);

    // just to be sure eql is doing what it is expected
    expect(keypair1.publicKey).eql(keyPair.publicKey);
    expect(keypair1.secretKey).eql(keyPair.secretKey);
    expect(keypair1.seedPhrase).eql(keyPair.seedPhrase);
    expect(fs.existsSync(path)).is.true;
    fs.removeSync(path);
    expect(fs.existsSync(path)).is.false;
  });
});
