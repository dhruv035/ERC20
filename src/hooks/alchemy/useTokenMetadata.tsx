import { useAlchemyContext } from "@/context/RootContext";
import { Alchemy, TokenMetadataResponse } from "alchemy-sdk";
import { useCallback, useEffect, useState } from "react";
import { useCall } from "wagmi";

const useTokenMetadata = async (tokenAddress: string) => {
  const { alchemy } = useAlchemyContext();
  const [metaData, setMetaData] = useState<TokenMetadataResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  
  const refetch = useCallback(() => {
    if (!tokenAddress || !alchemy) {
      setMetaData(null);
      return;
    }
    setIsFetching(true);
    alchemy.core.getTokenMetadata(tokenAddress).then((data) => {
      setMetaData(data);
      setIsFetching(false);
      if(!isInitialized){
        setIsInitialized(true);
      }
    });
  }, [tokenAddress, alchemy, isInitialized]);
  useEffect(() => {
    refetch();
  }, []);
  return { metaData, isFetching, refetch, isInitialized };
};
export default useTokenMetadata;
