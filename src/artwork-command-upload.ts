import fs from 'fs-extra';
import path from 'path';
import Bundlr from '@bundlr-network/client';
import { hash } from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { Buffer } from 'buffer';
import Arweave from 'arweave';
import { ArtworkCommandLineOptions, Tag } from './artwork-types';
import { addToBasename, compareFiles, decrypt, encrypt, newKeyPairPlus, writeKeyPairFile } from './artwork-util';
import moment from 'moment';

let verbose = false;
let logFile = '';
const _log = [`*** Start artwork upload ***`];
const log = (s: string) => {
  const m = `${moment().format('YYYY-MM-DD HH:mm:SS Z')} ${s}`;
  if (verbose) {
    console.log(m);
  }
  _log.push(m);
};

function errorAndExit(m: string) {
  log(m);
  console.error(m);
  writeLog();
  process.exit(1);
}

function writeLog() {
  if (logFile) {
    fs.writeFileSync(logFile, _log.join('\n'), 'utf8');
  }
}

export async function artworkUpload(cliOptions: ArtworkCommandLineOptions) {
  _log.length = 0;
  const { dryrun, arweaveHost, arweavePort, arweaveProtocol, outdir, walletfile, bundlrUrl, file, tagfile } =
    cliOptions;
  log(`*** Start artwork upload ***`);

  if (dryrun) {
    log(`Option dryrun detected: no real upload will be done!`);
  }

  try {
    log(`Try to initialize Arweave with (host, port, protocol): ${arweaveHost} ${arweavePort} ${arweaveProtocol} ...`);
    const arweave = Arweave.init({
      host: arweaveHost,
      port: arweavePort,
      protocol: arweaveProtocol
    });
    log(`Arweave initialized!`);

    //
    // outdir
    //
    if (!outdir) {
      errorAndExit('missing --outdir option');
    }
    if (!fs.existsSync(outdir)) {
      errorAndExit(`outdir ${outdir} does not exist!`);
    }
    if (fs.readdirSync(outdir).length > 0) {
      errorAndExit(`outdir ${outdir} is not empty! Please, make sure the outdir is empty.`);
    }

    log(`Found outdir ready and empty: ${outdir}`);

    logFile = path.join(outdir, 'upload.log');

    let bundlr;

    //
    // walletfile and bundlr
    //
    if (!walletfile) {
      errorAndExit('missing --walletfile option');
    }
    if (!fs.existsSync(walletfile)) {
      errorAndExit(`file ${walletfile} does not exist!`);
    }
    try {
      const jwk = JSON.parse(fs.readFileSync(walletfile).toString());
      bundlr = new Bundlr(bundlrUrl, 'arweave', jwk);
      log(`Found Arweave address ${bundlr.address}`);
    } catch (e) {
      errorAndExit(`error occurred while reading the wallet file ${walletfile}: ${e.message}`);
    }
    log(`Found walletfile: ${walletfile}`);

    //
    // file
    //

    if (!file) {
      errorAndExit('missing --file option');
    }
    if (!fs.existsSync(file)) {
      errorAndExit(`file ${file} does not exist!`);
    }
    const fileEncPath = addToBasename(path.join(outdir, path.basename(file)), '-encrypted');
    log(`Found file (artwork): ${file}`);

    //
    // tagfile
    //

    let tags: Tag[] = [];

    if (tagfile) {
      if (!fs.existsSync(tagfile)) {
        errorAndExit(`The tagfile ${tagfile} does not exist!`);
      } else {
        const tagsJson = fs.readFileSync(tagfile, 'utf8');
        log('Try to read tagfile.');
        tags = JSON.parse(tagsJson);
      }
    } else {
      log('No tag file provided, will use defaults!');
    }

    //
    // create key pair and save keys in outdir keypair.json
    //
    log('Create key pair for encryption of file (artwork)!');
    const keyPair = newKeyPairPlus();
    const keyPairPath = path.join(outdir, 'keyPair.json');
    const publicEncKey = writeKeyPairFile(keyPair, keyPairPath);
    log(`Key pair written to ${keyPairPath}!`);

    // encrypt file
    log(`Encrypt file (artwork): ${file}`);
    const buffer = fs.readFileSync(file);
    const data = new Uint8Array(buffer);
    const dataSHA512Hash = encodeBase64(hash(data));
    const dataEnc = encrypt(keyPair, data);
    const dataSHA512EncHash = encodeBase64(hash(dataEnc));
    fs.writeFileSync(fileEncPath, Buffer.from(dataEnc));
    log(`Encrypted file (artwork) written to: ${fileEncPath}`);
    const fileOutPath = path.join(outdir, path.basename(file));
    fs.writeFileSync(fileOutPath, Buffer.from(data));
    log(`Original file (artwork) written to: ${fileOutPath}`);

    const fileEnc4CheckData = fs.readFileSync(fileEncPath);
    const dataEncDec = decrypt(keyPair, fileEnc4CheckData);
    const fileEncDecPath = addToBasename(path.join(outdir, path.basename(fileEncPath)), '-decrypted');
    fs.writeFileSync(fileEncDecPath, Buffer.from(dataEncDec));
    log(`Encrypted/Decrypted file (artwork) written to: ${fileEncDecPath}`);

    const checkEnc = compareFiles(file, fileEncDecPath);
    if (!checkEnc) {
      errorAndExit('There is a serious problem with encrytion/decryption. Can not proceed!');
    } else {
      log('Encryption/Decryption check successfull!');
    }
    // decrypt and check file

    // ar-upload encrypted file
    tags = [
      ...tags,
      {
        name: 'Content-Type',
        value: 'application/octet-stream'
      },
      {
        name: 'filename',
        value: path.basename(fileEncPath)
      },
      { name: 'publicKeyFromKeyPair', value: publicEncKey },
      { name: 'uploaderAddress', value: bundlr.address },
      { name: 'dataSHA512Hash', value: dataSHA512Hash },
      { name: 'dataSHA512EncHash', value: dataSHA512EncHash }
    ];

    fs.writeFileSync(path.join(outdir, 'arTags.json'), JSON.stringify(tags, null, ' '), 'utf8');

    const balance = +arweave.ar.winstonToAr(await arweave.wallets.getBalance(bundlr.address));

    const lastTransactionID = await arweave.wallets.getLastTransactionID(bundlr.address);

    const loadedBalance = +arweave.ar.winstonToAr((await bundlr.getLoadedBalance()).toString());

    const price = +arweave.ar.winstonToAr((await bundlr.getPrice(Math.round(dataEnc.length * 1.2))).toString());

    log(`Last Arweave transaction ID: ${lastTransactionID}`);
    log(`Current Arweave balance ($AR): ${balance}`);
    log(`Current loaded balance ($AR): ${loadedBalance}`);
    log(`Estimated AR price: ${price}`);
    log(`Last Arweave transaction ID: ${lastTransactionID}`);
    // create the bundled transaction and sign it
    if (dryrun) {
      log('AR upload will be skipped due to dryrun option!');
    } else {
      // check ar-funding
      if (price > balance) {
        errorAndExit(
          `not enough fund ($AR) on your bundlr account. Estimated price: ${price}, current loaded oaded balance: ${balance}.`
        );
      }
      const tx = bundlr.createTransaction(dataEnc, { tags });
      await tx.sign();
      // upload the transaction to bundlr for inclusion in a bundle to be posted
      log(`Start Arweave upload`);
      const uploadResponse = await tx.upload();
      log(`Arweave upload done!`);
      log(`Arweave uploadResponse: ${JSON.stringify(uploadResponse, null, ' ')}`);
      log(`Upload done - transaction will be done in 5 to 20 minutes!`);

      log(`Check file access: https://arweave.net/${uploadResponse.id}`);
      log(`Check transaction: https://viewblock.io/arweave/tx/${uploadResponse.id}`);
    }

    // write PDF report
  } catch (e) {
    errorAndExit(e.message);
  }
  writeLog();
}
