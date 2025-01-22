import { Alchemy, Network, TransactionResponse } from "alchemy-sdk";
import { useEffect, useState } from "react";

const useTransaction = async(chainId: number,hash:string) => {
    const [data,setData] = useState<TransactionResponse | null>();
    const [isFetching,setIsFetching] = useState(false);
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA,
    network: chainId
      ? chainId === 1
        ? Network.ETH_MAINNET
        : Network.ETH_SEPOLIA
      : undefined, // Expand with a chainId to alchemy network mapping
  };
  const alchemy = new Alchemy(settings);

  useEffect(() => {
    if(hash){
        setIsFetching(true);
        alchemy.core.getTransaction(hash).then((data) => {
            setData(data);
            setIsFetching(false);
        });
    }
  },[hash]);
    return {data,isFetching};
};

export default useTransaction;
