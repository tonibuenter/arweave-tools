#!/usr/bin/env node

import * as process from 'process';
import commandLineArgs from 'command-line-args';
import { artworkCommandDefinitions, ArtworkCommandLineOptions } from './artwork-types';
import { artworkUpload } from './artwork-command-upload';
import { artworkCommandLineUsage } from './artwork-usage';
import { artworkFund } from './artwork-command-fund';

(async function () {
  await artworkCommand()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .then(() => {
      process.exit(0);
    });
})();

export async function artworkCommand() {
  let options: ArtworkCommandLineOptions;

  try {
    options = commandLineArgs(artworkCommandDefinitions, {
      stopAtFirstUnknown: false
    }) as ArtworkCommandLineOptions;
  } catch (e) {
    console.error(e.message);
    return;
  }

  /* second - parse the merge command options */
  switch (options.command) {
    case 'test': {
      console.log(options);
      return options;
    }
    case 'upload': {
      return artworkUpload(options);
    }
    case 'fund': {
      return artworkFund(options);
    }
    case 'help':
    default: {
      console.log(artworkCommandLineUsage);
      return 0;
    }
  }
}
