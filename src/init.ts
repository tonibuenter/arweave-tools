import Bundlr from '@bundlr-network/client';
import fs from 'fs';
import Arweave from 'arweave';
import 'dotenv/config';

export const initArweave = async () =>
  Arweave.init({
    host: process.env.ARWEAVE_HOST,
    port: process.env.ARWEAVE_PORT,
    protocol: process.env.ARWEAVE_PROTOCOL
  });

export const initBundlr = async () => {
  const jwk = JSON.parse(fs.readFileSync(process.env.WALLET_FILE).toString());
  const bundlrNetwork = process.env.BUNDLR_NETWORK;
  return new Bundlr(bundlrNetwork, 'arweave', jwk);
};
