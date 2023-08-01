import { getBundleFee } from 'arseeding-js';

const run = async () => {
  const arseedingUrl = 'https://arseed.web3infra.dev';
  const size = '100000000000';
  const currency = 'usdc';
  const res = await getBundleFee(arseedingUrl, size, currency);
  console.log(res);
  if (res?.decimals) {
    const decimals = +res.decimals;
    const zeros = new Array(decimals).fill(0).join('');
    let fee = zeros + res.finalFee;
    let dec = fee.substring(fee.length - decimals);
    let pre = fee.substring(0, fee.length - decimals);

    console.log(pre, dec);
  }
};

run();
