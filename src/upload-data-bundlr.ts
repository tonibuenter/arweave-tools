import { initArweave, initBundlr, uploadImageFileMythen } from './init';
import fs from 'fs';

async function runit() {
  const arweave = initArweave();
  const bundlr = await initBundlr();

  const imageDataMythen = fs.readFileSync(uploadImageFileMythen());

  try {
    if (imageDataMythen.length < 100) {
      console.warn(
        `Looks like the file ${uploadImageFileMythen()} is not read properly read: ${imageDataMythen}. Image size is: ${
          imageDataMythen.length
        } bytes.`
      );
      process.exit(1);
    }

    const balance = +arweave.ar.winstonToAr((await bundlr.getLoadedBalance()).toString());
    const price = +arweave.ar.winstonToAr((await bundlr.getPrice(Math.round(imageDataMythen.length * 1.2))).toString());

    if (price > balance) {
      console.warn(
        `Looks like the file there is not enough fund on your bundlr account. Needed: ${price}, Loaded balance: ${balance}.`
      );
      process.exit(1);
    }

    console.warn(`Fund needed: ${price}, Loaded balance: ${balance}.`);

    // add a custom tag that tells the gateway how to serve this data to a browser
    const tags = [
      {
        name: 'Content-Type',
        value: 'image/jpg'
      },
      {
        name: 'author',
        value: 'Toni A. Buenter'
      },

      {
        name: 'evmOwnerAddress',
        value: '0xd2d6e53496cb9039fa6ef317791b5abe9d299cc4'
      },
      {
        name: 'imageLocation',
        value: '8849 Alpthal, Switzerland'
      },
      {
        name: 'imageDescription',
        value: 'Shadow image of the mythen mountain and its neighbours Kleiner Mythen and Haggenstock'
      }
    ];

    // create the bundled transaction and sign it
    const tx = bundlr.createTransaction(imageDataMythen, { tags });
    await tx.sign();
    // upload the transaction to bundlr for inclusion in a bundle to be posted
    console.log(`upload started...`);
    const uploadResponse = await tx.upload();
    console.log(`upload ended...`);
    console.log(`uploadResponse: ${JSON.stringify(uploadResponse, null, ' ')}`);
    // Fund the node

    console.log(`Upload done check https://arweave.net/${uploadResponse.id}`);
  } catch (e) {
    console.error(e);
  }
}

runit();
