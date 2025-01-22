import { Alchemy, TokenMetadataResponse } from "alchemy-sdk";
import { useEffect, useState } from "react";

const useTokenMetadata = async (alchemy: Alchemy, tokenAddress: string) => {
  const [metaData, setMetaData] = useState<TokenMetadataResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    if (!tokenAddress || !alchemy) return;
    setIsFetching(true);
    alchemy.core.getTokenMetadata(tokenAddress).then((data) => {
      setMetaData(data);
      setIsFetching(false);
    });
  }, [tokenAddress, alchemy]);
  return { metaData, isFetching };
};
export default useTokenMetadata;
