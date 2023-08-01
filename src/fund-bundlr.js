import { initArweave, initBundlr } from './init';

async function runit() {
  const arweave = initArweave();
  const bundlr = initBundlr();

  const balance = await arweave.wallets.getBalance(bundlr.address);
  const balanceAr = +arweave.ar.winstonToAr(balance);
  const amountArToFund = 1;

  if (balanceAr / 2 < amountArToFund) {
    console.warn(`Amount to fund (${amountArToFund}) is more than half of balance (${balanceAr})`);
    process.exit(1);
  }

  // Fund 0.5 MATIC
  // Convert to atomic units
  //const fundAmountAtomic = bundlr.utils.toAtomic(amountToFund);
  // Fund the node
  // const fundTx = await bundlr.fund(fundAmountAtomic);

  // Upload data
  // const dataToUpload = 'GM world.';
  // try {
  //   const response = await bundlr.upload(dataToUpload);
  //   console.log(`Data uploaded ==> https://arweave.net/${response.id}`);
  // } catch (e) {
  //   console.log('Error uploading file ', e);
  // }
}

runit();
