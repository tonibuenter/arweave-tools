import { initArweave, initBundlr } from './init';

async function runit() {
  const arweave = initArweave();
  const bundlr = await initBundlr();

  const balance = await arweave.wallets.getBalance(bundlr.address);
  const balanceAr = +arweave.ar.winstonToAr(balance);
  const amountArToFund = 0.2;

  if (balanceAr / 2 < amountArToFund) {
    console.warn(`Amount to fund (${amountArToFund}) is more than half of balance (${balanceAr})`);
    process.exit(1);
  }

  console.log(`try to fund ${amountArToFund} to ${bundlr.url}`);

  const fundAmountAtomic = arweave.ar.arToWinston(amountArToFund.toString());

  console.log(`fundAmountAtomic: ${fundAmountAtomic}`);

  // Fund the node
  console.log(`fund transaction starts...`);
  try {
    const fundTx = await bundlr.fund(fundAmountAtomic);
    console.log(`fund transaction ended...`);

    console.log(`fundTx: ${JSON.stringify(fundTx, null, ' ')}`);

    // fundTx: {
    //  "reward": "2564790",
    //  "target": "ZE0N-8P9gXkhtK-07PQu9d8me5tGDxa_i4Mee5RzVYg",
    //  "quantity": "200000000000",
    //  "id": "Mhm1W5Lr2DzarnTBixn5X1Q1MZED_Ioi-wwr9mZXmYM"
    // }
  } catch (e) {
    console.error(e);
  }
}

runit();



