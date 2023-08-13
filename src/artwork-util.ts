import path from 'path';
import fs from 'fs-extra';
import nacl, { BoxKeyPair, randomBytes } from 'tweetnacl';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';

import { KeyPairPlus, Log } from './artwork-types';
import Arweave from 'arweave';
import Bundlr from '@bundlr-network/client';

export function addToBasename(filePath: string, addition: string): string {
  let dirname = path.dirname(filePath);
  let basename = path.basename(filePath);
  let extname = path.extname(filePath);
  basename = basename.substring(0, basename.length - extname.length);
  return path.format({ root: dirname + '/', name: basename + addition, ext: extname });
}

export function compareFiles(file1, file2) {
  const buffer1 = fs.readFileSync(file1);
  const buffer2 = fs.readFileSync(file2);

  if (buffer1.length !== buffer2.length) {
    return false;
  }

  for (let i = 0; i < buffer1.length; i++) {
    if (buffer1[i] !== buffer2[i]) {
      return false;
    }
  }

  return true;
}

export function u8ToHex(u: Uint8Array): string {
  return Buffer.from(u).toString('hex');
}

export function hexToU8(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    console.error('Invalid hexString');

    return new Uint8Array();
  }

  var arrayBuffer = new Uint8Array(hexString.length / 2);

  for (var i = 0; i < hexString.length; i += 2) {
    var byteValue = parseInt(hexString.substr(i, 2), 16);

    if (isNaN(byteValue)) {
      console.error('Invalid hexString');

      return new Uint8Array();
    }

    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
}

export const newNonce = (): Uint8Array => randomBytes(nacl.box.nonceLength);

export function encrypt({ publicKey, secretKey }: BoxKeyPair, data: Uint8Array) {
  const nonce = newNonce();
  const encrypted = nacl.box(data, nonce, publicKey, secretKey);
  if (!encrypted) {
    return null;
  }
  const fullEncrypted = new Uint8Array(nonce.length + encrypted.length);
  fullEncrypted.set(nonce);
  fullEncrypted.set(encrypted, nonce.length);
  return fullEncrypted;
}

export const decrypt = ({ publicKey, secretKey }: BoxKeyPair, dataEnc: Uint8Array): Uint8Array | null => {
  const nonce = dataEnc.subarray(0, nacl.box.nonceLength);
  const contentOnly = dataEnc.subarray(nacl.box.nonceLength, dataEnc.length);
  return nacl.box.open(contentOnly, nonce, publicKey, secretKey);
};

export function newKeyPairPlus(seedPhraseIn?: string): KeyPairPlus {
  const wallet = seedPhraseIn ? ethers.Wallet.fromPhrase(seedPhraseIn) : ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const { secretKey, publicKey } = nacl.box.keyPair.fromSecretKey(
    new Uint8Array(Buffer.from(privateKey.substring(2), 'hex'))
  );
  const seedPhrase = wallet.mnemonic.phrase;
  return { secretKey, publicKey, seedPhrase };
}

export function readKeyPairFile(filename): KeyPairPlus {
  const json = fs.readFileSync(filename).toString('utf8');
  const kp = JSON.parse(json);
  const { secretKey, publicKey, seedPhrase } = kp;
  return {
    publicKey: hexToU8(publicKey),
    secretKey: hexToU8(secretKey),
    seedPhrase
  };
}

export function writeKeyPairFile(keyPair: KeyPairPlus, filename): string {
  const { secretKey, publicKey, seedPhrase } = keyPair;
  const keyPairJson = JSON.stringify(
    {
      publicKey: u8ToHex(publicKey),
      secretKey: u8ToHex(secretKey),
      seedPhrase,
      info: 'done by nacl.box.keyPair'
    },
    null,
    ' '
  );
  fs.writeFileSync(filename, keyPairJson, 'utf8');
  return u8ToHex(publicKey);
}

type InitArweave = {
  arweaveHost: string;
  arweavePort: number;
  arweaveProtocol: string;
  log?: Log;
};

export function initArweave({ arweaveHost, arweavePort, arweaveProtocol, log = () => {} }: InitArweave) {
  log(`Initialize Arweave with (host, port, protocol): ${arweaveHost} ${arweavePort} ${arweaveProtocol}`);
  const arweave = Arweave.init({
    host: arweaveHost,
    port: arweavePort,
    protocol: arweaveProtocol
  });
  log(`Arweave initialized!`);
  return arweave;
}

type InitBundlr = {
  walletfile?: string;
  bundlrUrl: string;
  log?: Log;
};

export async function initBundlr({ walletfile, bundlrUrl, log = () => {} }: InitBundlr): Promise<any> {
  if (!walletfile) {
    errorAndExit('missing --walletfile option');
  }
  if (!fs.existsSync(walletfile)) {
    errorAndExit(`file ${walletfile} does not exist!`);
  }
  log(`Found walletfile: ${walletfile}`);
  log(`Initialize Bundlr with url: ${bundlrUrl}`);
  try {
    const jwk = JSON.parse(fs.readFileSync(walletfile).toString());
    const bundlr = new Bundlr(bundlrUrl, 'arweave', jwk);
    log(`Bundlr initialized with address ${bundlr.address}!`);
    return bundlr;
  } catch (e) {
    errorAndExit(`error occurred while reading the walletfile ${walletfile}: ${e.message}`);
  }
  return null;
}

export function errorAndExit(m: string) {
  console.error(m);
  process.exit(1);
}
