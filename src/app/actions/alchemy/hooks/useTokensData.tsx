import { TokenData } from "@/lib/types";

import { formatUnits } from "viem";

import { Alchemy, TokenBalance } from "alchemy-sdk";
import { hexToBigInt } from "viem";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const useTokensData = async (alchemy: Alchemy, tokenAddresses: Array<string>,zeroBalance:boolean = false) => {
  const {address} = useAccount();
  const [data, setData] = useState<TokenData[] | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    if (!address || !alchemy || !tokenAddresses) return; 
    setIsFetching(true);
    alchemy.core
      .getTokenBalances(address as `0x${string}`,tokenAddresses)
      .then(async (data) => {
        const formatted = await formatTokenData(alchemy, data.tokenBalances);
        setData(formatted);
        setIsFetching(false);
      });
  }, [address, alchemy,tokenAddresses]);
  return { data, isFetching };
};
export default useTokensData;


const formatTokenData = async (alchemy: Alchemy,data: TokenBalance[],zeroBalance:boolean = false) => {
  const formatted = await Promise.all(
    data
      .filter(
        (token) =>
          token.tokenBalance &&
          (zeroBalance ? true : hexToBigInt(token.tokenBalance as `0x${string}`) > 0),
      )
      .map(async (token) => {
        const metaData = await alchemy.core.getTokenMetadata(
          token.contractAddress,
        );
        const balance = formatUnits(
          hexToBigInt(token.tokenBalance as `0x${string}`),
        metaData.decimals ?? 6,
      );
      return {
        metaData,
        address: token.contractAddress,
        balance,
      } as TokenData;
    }),
  );
  return formatted;
};
