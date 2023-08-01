import Bundlr from '@bundlr-network/client';
import fs from 'fs';
import Arweave from 'arweave';
import 'dotenv/config';

async function runit() {

  const arweave = Arweave.init({
    host:process.env.ARWEAVE_HOST,
    port: process.env.ARWEAVE_PORT,
    protocol: process.env.ARWEAVE_PROTOCOL
  });

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
