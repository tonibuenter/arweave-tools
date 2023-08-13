import { OptionDefinition } from 'command-line-args';

export const artworkCommandDefinitions: OptionDefinition[] = [
  { name: 'command', defaultOption: true },
  { name: 'file', alias: 'f', type: String },
  { name: 'outdir', alias: 'o', type: String },
  { name: 'walletfile', alias: 'w', type: String },
  { name: 'tagfile', alias: 't', type: String },
  { name: 'dryrun', alias: 'd', type: Boolean, defaultValue: false },
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
  { name: 'bundlrUrl', type: String, defaultValue: 'http://node2.bundlr.network' },
  { name: 'arweaveHost', type: String, defaultValue: 'arweave.net' },
  { name: 'arweavePort', type: Number, defaultValue: '443' },
  { name: 'arweaveProtocol', type: String, defaultValue: 'https' },
  { name: 'amount', alias: 'a', type: String, defaultValue: '0' }
];

export interface ArtworkCommandLineOptions {
  command: string;
  file: string;
  tagfile: string;
  outdir: string;
  dryrun: boolean;
  verbose: boolean;
  walletfile: string;
  bundlrUrl: string;
  arweaveHost: string;
  arweavePort: number;
  arweaveProtocol: string;
  // fund
  amount: string;
  _unknown: any;
}

export type Tag = { name: string; value: string };
export type KeyPairPlus = { secretKey: Uint8Array; publicKey: Uint8Array; seedPhrase: string };

export type Log = (m: string, important?: boolean | number) => void;
