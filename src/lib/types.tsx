

export type TokenData = {
    balance: string;
    address: string;
    metaData: MetaData;
  };
  
  export type MetaData = {
    decimals: number;
    logo: string | null;
    name: string;
    symbol: string;
  };
  
  export type FormData = {
    selectedToken: TokenData | undefined;
    toAddress: string;
    amount: string;
  };
export type GasSettings = {
  isDisabled: boolean;
  maxPriorityFee: string;
  maxFee: string;
};

export type AddressBook = {
  name: string;
  address: string;
};
export type FetchStates = {
  metaData: boolean;
  tokenData: boolean;
  tokenDataArray: boolean;
  allTokenData: boolean;
  transaction: boolean;
};

export type PendingState = {
  isTxDisabled: boolean;
  pendingTx: `0x${string}` | undefined;
  pendingTxBlock: bigint | undefined;
  maxFee: bigint | undefined;
  maxPriorityFee: bigint | undefined;
  to: string | undefined;
  data: string | undefined;
  nonce: number | undefined;
};
export type Deployment = {
  address: string;
  j1: string;
  j2?: string;
};
