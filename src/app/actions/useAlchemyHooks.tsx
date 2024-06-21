"use  client";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alchemy,
  Network,
  TokenMetadataResponse,
  TransactionResponse,
} from "alchemy-sdk";
import { MetaData, TokenData } from "../page";
import { formatUnits, hexToBigInt } from "viem";
import { useChainContext } from "../context/RootContext";
import { useAccount, useChainId } from "wagmi";

//Global contexts may be persisted and managed here

type FetchStates = {
  metaData: boolean;
  tokenData: boolean;
  tokenDataArray: boolean;
  allTokenData: boolean;
  transaction: boolean;
};

export type AlchemyContextType = {
  isFetchingAlchemy: boolean;
  fetchStates: FetchStates;
  initializeStates: FetchStates;
  getMetaData: (
    tokenAddress: string,
  ) => Promise<TokenMetadataResponse | undefined>;
  getTokenData: (tokenAddress: string) => Promise<TokenData | undefined>;
  getAllTokenData: () => Promise<TokenData[] | undefined>;
  getTransaction: (hash: string) => Promise<TransactionResponse | undefined>;
  resetInitializeStates: () => void;
};

export const AlchemyContext = createContext<AlchemyContextType>(
  {} as AlchemyContextType,
);

const defaultFetchState:FetchStates = {
  metaData: false,
    tokenData: false,
    tokenDataArray: false,
    allTokenData: false,
    transaction: false,
}
const useAlchemyHooks = () => {
  const { address, chainId } = useAccount();

  const [fetchStates, setFetchStates] = useState<FetchStates>(defaultFetchState);

  const [initializeStates, setInitializeStates] = useState<FetchStates>(defaultFetchState);

  const alchemy = useMemo(() => {
    const settings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA,
      network: chainId
        ? chainId === 1
          ? Network.ETH_MAINNET
          : Network.ETH_SEPOLIA
        : undefined, // Expand with a chainId to alchemy network mapping
    };
    return new Alchemy(settings);
  }, [chainId]);

  const setFetchState = (type: keyof FetchStates, state: boolean) => {
    setFetchStates((prevState) => ({ ...prevState, [type]: state }));
  };

  const setInitializeState = (type: keyof FetchStates, state: boolean) => {
    setInitializeStates((prevState) => ({ ...prevState, [type]: state }));
  };
  const fetchRef = useRef<FetchStates>();
  fetchRef.current = fetchStates;

  const initializeRef = useRef<FetchStates>();
  initializeRef.current = initializeStates;

  const getMetaData = useCallback(
    async (tokenAddress: string) => {
      if (fetchRef.current?.metaData === true) {
        return {} as MetaData;
      }
      setFetchState("metaData", true);
      const response = await alchemy.core.getTokenMetadata(tokenAddress);
      setFetchState("metaData", false);
      if (initializeRef.current?.metaData === false) {
        setInitializeState("metaData", true);
      }
      return response;
    },
    [alchemy],
  );

  
  const resetInitializeStates = () => {
    setInitializeStates(defaultFetchState);
  };

  const resetFetchStates = () => {
    setFetchStates(defaultFetchState)
  }

  useEffect(() => {
    resetInitializeStates();
  }, [address,chainId]);

  const getTokenDataArray = useCallback(
    async (tokenAddresses: Array<string>) => {
      
      if(tokenAddresses.length<1)
        return;
      if (fetchRef.current?.tokenDataArray === true) {
        console.log("REJECTING",tokenAddresses)
        return;
      }
      else
      setFetchState("tokenDataArray", true);
      const res = await alchemy.core.getTokenBalances(
        address as string,
        tokenAddresses,
      );

      const tokensData: Array<TokenData> = await Promise.all(
        res.tokenBalances.map(async (token) => {
          const metaData = await alchemy.core.getTokenMetadata(
            token.contractAddress,
          );
          const balance = formatUnits(
            hexToBigInt(token.tokenBalance as `0x${string}`),
            metaData.decimals ?? 9,
          );
          return {
            metaData,
            address: token.contractAddress,
            balance,
          } as TokenData;
        }),
      );
      setFetchState("tokenDataArray", false);
      if (initializeRef.current?.tokenDataArray === false) {
        setInitializeState("tokenDataArray", true);
      }
      return tokensData;
    },
    [alchemy, address],
  );
  const getTokenData = useCallback(
    async (tokenAddress: string|undefined) => {
      if(!tokenAddress)
        return;
      if (fetchRef.current?.tokenData === true) {
        return;
      }
      setFetchState("tokenData", true);
      const metaData = await alchemy.core.getTokenMetadata(tokenAddress);
      const addresses = [tokenAddress];
      const res = await alchemy.core.getTokenBalances(
        address as string,
        addresses,
      );
      const response = res.tokenBalances[0];
      const balance = formatUnits(
        hexToBigInt(response.tokenBalance as `0x${string}`),
        metaData.decimals ?? 9,
      );
      const tokenData = {
        metaData,
        address: tokenAddress,
        balance,
      } as TokenData;
      setFetchState("tokenData", false);
      if (initializeRef.current?.tokenData === false) {
        setInitializeState("tokenData", true);
      }
      return tokenData;
    },
    [alchemy, address],
  );

  const getAllTokenData = useCallback(async () => {
    if (fetchRef.current?.allTokenData === true) {
      return;
    }
    setFetchState("allTokenData", true);
    //This function returns non 0 balances for all the tokens, can be edited to show zero balance tokens as well based on all tokens you have ever interacted with
    const data = await alchemy.core.getTokenBalances(address as `0x${string}`);
    const formatted = await Promise.all(
      data.tokenBalances
        .filter(
          (token) =>
            token.tokenBalance &&
            hexToBigInt(token.tokenBalance as `0x${string}`) > 0,
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

    setFetchState("allTokenData", false);
    if (initializeRef.current?.allTokenData === false) {
      setInitializeState("allTokenData", true);
    }
    return formatted;
  }, [alchemy, address]);

  const getTransaction = useCallback(
    async (hash: string) => {
      if (fetchRef.current?.transaction === true) {
        return;
      }
      setFetchState("transaction", true);
      const response = await alchemy.core.getTransaction(hash);
      setFetchState("transaction", false);

      if (initializeRef.current?.transaction === false) {
        setInitializeState("transaction", true);
      }

      return response ?? undefined;
    },
    [alchemy],
  );

  return {
    fetchStates,
    initializeStates,
    getMetaData,
    getTokenData,
    getTokenDataArray,
    getAllTokenData,
    getTransaction,
    resetInitializeStates,
  };
};

export default useAlchemyHooks;
