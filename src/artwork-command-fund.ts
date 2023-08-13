import { ArtworkCommandLineOptions } from './artwork-types';
import { errorAndExit, initArweave, initBundlr } from './artwork-util';

let verbose = false;

const log = (m: string, important?: boolean) => {
  if (verbose || important) {
    console.log(m);
  }
};

export async function artworkFund(cliOptions: ArtworkCommandLineOptions) {
  verbose = cliOptions.verbose;
  log(`*** Start artwork fund ***`, true);

  const { walletfile, bundlrUrl, dryrun, amount } = cliOptions;
  const { arweaveHost, arweavePort, arweaveProtocol } = cliOptions;

  if (dryrun) {
    log(`Option dryrun detected: no real funding will be done!`);
  }

  try {
    const amountArToFund = +amount;
    if (!amountArToFund) {
      errorAndExit('No valid funding amount defined!');
    }

    const arweave = initArweave({ arweaveHost, arweavePort, arweaveProtocol, log });

    const bundlr = await initBundlr({ walletfile, bundlrUrl, log });

    const balanceAr = +arweave.ar.winstonToAr(await arweave.wallets.getBalance(bundlr.address));

    const lastTransactionID = await arweave.wallets.getLastTransactionID(bundlr.address);

    const loadedBalance = +arweave.ar.winstonToAr((await bundlr.getLoadedBalance()).toString());

    log(`Last Arweave transaction ID: ${lastTransactionID}`);
    log(`Current Arweave balance ($AR): ${balanceAr}`);
    log(`Current loaded balance ($AR): ${loadedBalance}`);
    log(`Last Arweave transaction ID: ${lastTransactionID}`);
    // create the bundled transaction and sign it
    log(`Amount to fund: ${amountArToFund}`);
    if (balanceAr / 2 < amountArToFund) {
      errorAndExit(`Amount to fund (${amountArToFund}) is more than half of balance (${balanceAr})`);
    }
    log(`Amount to fund: ${amountArToFund} accepted!`);
    if (dryrun) {
      log('Funding will be skipped due to dryrun option!');
    } else {
      log(`Try to fund ${amountArToFund} to ${bundlr.url}`);

      const fundAmountAtomic = arweave.ar.arToWinston(amountArToFund.toString());

      log(`Fund amount atomic: ${fundAmountAtomic}`);

      log(`Fund transaction starts`);

      const fundTx = await bundlr.fund(fundAmountAtomic);
      log(`Fund transaction ended`);

      log(`Fund transaction: ${JSON.stringify(fundTx, null, ' ')}`, true);
      log(`Check transaction: https://viewblock.io/arweave/tx/${fundTx.id}`);
      log(`Be aware, transactions may take 
      a couple of minutes to be 
      visible and more to be marked as successful!`);
    }

    // write PDF report
  } catch (e) {
    errorAndExit(e.message);
  }
}
