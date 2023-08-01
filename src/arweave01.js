import Arweave from 'arweave';
import fs from 'fs';

// load the JWK wallet key file from disk
let key = JSON.parse(fs.readFileSync('walletFile.txt').toString());

// initialize an arweave instance
const arweave = Arweave.init({});

//  create a wallet-to-wallet transaction sending 10.5AR to the target address
let transaction = await arweave.createTransaction(
  {
    target: '1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY',
    quantity: arweave.ar.arToWinston('10.5')
  },
  key
);

// you must sign the transaction with your key before posting
await arweave.transactions.sign(transaction, key);

// post the transaction
const response = await arweave.transactions.post(transaction);

// Posting a Data Transaction

// load the data from disk
const imageData = fs.readFileSync(`data/myImage.png`);

// create a data transaction
transaction = await arweave.createTransaction(
  {
    data: imageData
  },
  key
);

// add a custom tag that tells the gateway how to serve this data to a browser
transaction.addTag('Content-Type', 'image/png');

// you must sign the transaction with your key before posting
await arweave.transactions.sign(transaction, key);

// create an uploader that will seed your data to the network
let uploader = await arweave.transactions.getUploader(transaction);

// run the uploader until it completes the upload.
while (!uploader.isComplete) {
  await uploader.uploadChunk();
}
