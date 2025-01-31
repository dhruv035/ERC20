import { TokenData } from "@/lib/types";
import { formatUnits } from "viem";
import { Alchemy, TokenBalance } from "alchemy-sdk";
import { hexToBigInt } from "viem";
import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useAlchemyContext } from "@/context/RootContext";

const useTokensData = ({
  tokenAddresses,
  zeroBalances,
  allTokens,
}: {
  tokenAddresses?: Array<string> | undefined;
  zeroBalances?: boolean;
  allTokens?: boolean;
}) => {
  const { address } = useAccount();
  const { alchemy } = useAlchemyContext();
  const [data, setData] = useState<TokenData[] | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetch = useCallback(async () => {
    if (!address || !alchemy) {
      setData(undefined);
      return;
    }
    if (!allTokens && !tokenAddresses?.length) {
      setData(undefined);
      return;
    };
    setIsFetching(true);
    if (allTokens) {
      alchemy.core.getTokenBalances(address as `0x${string}`).then((data) => {
        getTokenData(data.tokenBalances).then((tokenData) => {
          setData(tokenData);
          setIsFetching(false);
          if(!isInitialized){
            setIsInitialized(true);
          }
        });
      });
    } else {
      alchemy.core
        .getTokenBalances(address as `0x${string}`, tokenAddresses)
        .then((data) => {
          getTokenData(data.tokenBalances).then((tokenData) => {
            setData(tokenData);
            setIsFetching(false);
            if(!isInitialized){
              setIsInitialized(true);
            }
          });
        });
    }
  }, [address, alchemy, tokenAddresses, allTokens, isInitialized]);

  useEffect(() => {
    fetch().then(() => {
    });
  }, []);

  const getTokenData = async (data: TokenBalance[]) => {
    const formatted = await Promise.all(
      data
        .filter(
          (token) =>
            token.tokenBalance &&
            (zeroBalances
              ? true
              : hexToBigInt(token.tokenBalance as `0x${string}`) > 0),
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

  return { data, isFetching, refetch: fetch, isInitialized };
};
export default useTokensData;
