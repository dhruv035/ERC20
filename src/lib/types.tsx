
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