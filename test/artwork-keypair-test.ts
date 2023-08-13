import { expect } from 'chai';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import {newKeyPairPlus} from "../src/artwork-util";

describe('artwork keypair', () => {
  it('keypair plus 01', () => {
    const keyPair1 = newKeyPairPlus();
    const keyPair2 = newKeyPairPlus(keyPair1.seedPhrase);
    expect(keyPair2.publicKey).eql(keyPair1.publicKey);
    expect(keyPair2.secretKey).eql(keyPair1.secretKey);
    expect(keyPair2.seedPhrase).eql(keyPair1.seedPhrase);
  });

  it('keypair plus 02', () => {
    const keyPair1 = newKeyPairPlus();
    const wallet = ethers.Wallet.fromPhrase(keyPair1.seedPhrase);
    const privateKey1 = '0x' + Buffer.from(keyPair1.secretKey).toString('hex');
    const publicKey1 = '0x' + Buffer.from(keyPair1.publicKey).toString('hex');
    expect(privateKey1).eql(wallet.privateKey);
    expect(publicKey1).not.eql(wallet.publicKey);
  });
});
