import commandLineUsage from 'command-line-usage';
import { artworkCommandDefinitions } from './artwork-types';

const commonArgs = [
  {
    name: 'walletfile',
    alias: 'w',
    typeLabel: '{underline walletfile} ',
    description: 'File containing the Arweave wallet information.'
  },
  {
    name: 'dryrun',
    description: 'Run upload except doing the real upload. (optional)'
  },
  {
    name: 'verbose',
    description: 'Produces a verbose output. Does not affect the log file. (optional)'
  },
  {
    name: 'bundlrUrl',
    typeLabel: '{underline bundlrUrl} ',
    description: `If not set uses the default: {bold ${
      artworkCommandDefinitions.find((e) => e.name === 'bundlrUrl').defaultValue
    }}`
  },
  {
    name: 'arweaveHost',
    typeLabel: '{underline arweaveHost} ',
    description: `If not set uses the default: {bold ${
      artworkCommandDefinitions.find((e) => e.name === 'arweaveHost').defaultValue
    }}`
  },
  {
    name: 'arweavePort',
    typeLabel: '{underline arweavePort} ',
    description: `If not set uses the default: {bold ${
      artworkCommandDefinitions.find((e) => e.name === 'arweavePort').defaultValue
    }}`
  },
  {
    name: 'arweaveProtocol',
    typeLabel: '{underline arweaveProtocol} ',
    description: `If not set uses the default: {bold ${
      artworkCommandDefinitions.find((e) => e.name === 'arweaveProtocol').defaultValue
    }}`
  }
];

export const artworkCommandLineUsage = commandLineUsage([
  {
    header: 'Welcome to artwork-tools',
    content:
      'Artwork-tools provides easy creation of a secure entry in arweave blockchain including encryption, key management and upload.'
  },
  {
    header: 'Command List',
    content: [
      {
        name: '{bold upload}',
        summary: 'Upload a single file (artwork), encrypted and signed to the arweave network.'
      },
      { name: '{bold fund}', summary: 'Fund $AR to bundlr for upload.' },
      { name: '{bold help}', summary: 'Get this help information.' }
    ]
  },
  {
    header: 'Arguments for {underline upload}',
    optionList: [
      {
        name: 'file',
        alias: 'f',
        typeLabel: '{underline file} ',
        description: 'Artwork file to be encrypted and uploaded to Arweave'
      },
      {
        name: 'outdir',
        alias: 'o',
        typeLabel: '{underline ourdir} ',
        description:
          'Directory containing the upload results such as encrypted file, encryption keys, upload log. The directory has to be empty!'
      },

      {
        name: 'tagfile',
        description:
          'An optional JSON file containing additional tags for the uploaded file. The content is a list of \\{name:string, value:string\\} objects. (optional)'
      },
      ...commonArgs
    ]
  },
  {
    header: 'Arguments for {underline fund}',
    optionList: [
      {
        name: 'amount',
        alias: 'a',
        typeLabel: '{underline amount} ',
        description:
          'Amount of $AR to be funded to the {bold bundlr} account. Maximum of 50% of wallet balance is allowed to fund.'
      },
      ...commonArgs
    ]
  }
]);
