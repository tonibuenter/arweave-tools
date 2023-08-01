import Bundlr from '@bundlr-network/client';
import fs from 'fs';
import 'dotenv/config';
import { initArweave } from './init';

async function runit() {
  const arweave = initArweave();
  const jwk = JSON.parse(fs.readFileSync(process.env.WALLET_FILE).toString());
  const bundlrNetwork = process.env.BUNDLR_NETWORK;
  const bundlr = new Bundlr(bundlrNetwork, 'arweave', jwk);

  const balance = await arweave.wallets.getBalance(bundlr.address);

  const lastTransactionID = await arweave.wallets.getLastTransactionID(bundlr.address);

  const loadedBalance = (await bundlr.getLoadedBalance()).toString();

  console.log(`ar address: ${bundlr.address}`);

  console.log(`*** ar blockchain ***`);
  console.log(`last transaction ID : ${lastTransactionID}`);
  console.log(`balance in winston  : ${balance}`);
  console.log(`balance in ar       : ${arweave.ar.winstonToAr(balance)}`);

  console.log(`*** ${bundlrNetwork} ***`);

  console.log(`loaded balance in winston           : ${loadedBalance}`);
  console.log(`loaded balance in ar                : ${arweave.ar.winstonToAr(loadedBalance)}`);
}

runit();
