import { useAlchemyContext } from "@/context/RootContext";
import { MetaData } from "@/lib/types";
import { Alchemy, TokenMetadataResponse } from "alchemy-sdk";
import { useCallback, useEffect, useState } from "react";
import { useCall } from "wagmi";

const useTokenMetadata = (tokenAddress: string) => {
  const { alchemy } = useAlchemyContext();
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  
  const refetch = useCallback(() => {
    if (!tokenAddress || !alchemy) {
      setMetaData(null);
      return;
    }
    setIsFetching(true);
    alchemy.core.getTokenMetadata(tokenAddress).then((data) => {
      const metaData:MetaData = {
        decimals: data.decimals ?? 0,
        logo: data.logo,
        name: data.name ?? "",
        symbol: data.symbol ?? ""
      }
      setMetaData(metaData);
      setIsFetching(false);
    });
  }, [tokenAddress, alchemy, isInitialized]);
  useEffect(() => {
    refetch();
  }, []);
  return { metaData, isFetching, refetch, isInitialized };
};
export default useTokenMetadata;
