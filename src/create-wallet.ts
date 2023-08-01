import Bundlr from '@bundlr-network/client';
import fs from 'fs-extra';
import Arweave from 'arweave';

async function runit() {
  const arweave = Arweave.init({});

  const jwk = await arweave.wallets.generate();

  const bundlr = new Bundlr('http://node2.bundlr.network', 'arweave', jwk);

  fs.mkdirsSync('./outdata');

  const outfile = `./outdata/wallet-${bundlr.address}.json`;

  fs.writeJsonSync(outfile, jwk);

  console.debug(`generated wallet save in: ${outfile}`);
}

runit();
