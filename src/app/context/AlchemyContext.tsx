"use  client";
import { NextPage } from "next";
import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChainContext } from "./RootContext";
import {
  Alchemy,
  Network,
  TokenBalancesResponse,
  TokenMetadataResponse,
  TransactionResponse,
} from "alchemy-sdk";
import { MetaData, TokenData } from "../page";
import { formatUnits, hexToBigInt } from "viem";

//Global contexts may be persisted and managed here

type FetchStates = {
  metaData: boolean;
  balance: boolean;
  allBalances: boolean;
  transaction: boolean;
};

export type AlchemyContextType = {
  getMetaData: (tokenAddress: string) => Promise<TokenMetadataResponse | undefined>;
  getBalance: (tokenAddress: string) => Promise<TokenBalancesResponse | undefined>;
  getAllBalances: (owner: string) => Promise<TokenData[] | undefined>;
  getTransaction: (hash: string) => Promise<TransactionResponse | undefined>;
  isFetchingAlchemy: boolean;
  fetchStates: FetchStates;
};

export const AlchemyContext = createContext<AlchemyContextType>(
  {} as AlchemyContextType
);

const AlchemyProvider: NextPage<{ children: ReactNode }> = ({ children }) => {
  const { address, chain } = useChainContext();

  const [fetchStates, setFetchStates] = useState<FetchStates>({
    metaData: false,
    balance: false,
    allBalances: false,
    transaction: false,
  });

  const alchemy = useMemo(() => {
    const settings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA,
      network: chain
        ? chain?.id === 1
          ? Network.ETH_MAINNET
          : Network.ETH_SEPOLIA
        : undefined, // Expand with a chainId to alchemy network mapping
    };
    return new Alchemy(settings);
  }, [chain?.id]);
  const isFetching = useMemo<boolean>(() => {
    
    let flag = Object.values(fetchStates).every((state)=>{state!==true})
    if (flag) return true;
    else return false;
  }, [fetchStates]);

  const setFetchState = (type: keyof FetchStates, state: boolean) => {
    setFetchStates((prevState) => ({ ...prevState, [type]: state }));
  };

  const fetchRef = useRef<FetchStates>();
  fetchRef.current = fetchStates;
  const getMetaData = useCallback(
    async (tokenAddress: string) => {
      if (fetchRef.current?.metaData === true) {
        return {} as MetaData;
      }
      setFetchState("metaData", true);
      const response = await alchemy.core.getTokenMetadata(tokenAddress);
      setFetchState("metaData", false);
      return response;
    },
    [alchemy]
  );

  const getBalance = useCallback(
    async (tokenAddress: string) => {
      if (fetchRef.current?.balance === true) {
        return;
      }
      setFetchState("balance", true);
      const addresses = [tokenAddress];
      const response = await alchemy.core.getTokenBalances(
        address as string,
        addresses
      );
      setFetchState("balance", false);
      return response;
    },
    [alchemy, address]
  );

  const fetchingRef = useRef<boolean>();
  fetchingRef.current = isFetching;

  const getAllBalances = useCallback(
    async (owner: string) => {
      if (fetchRef.current?.allBalances === true) {
        return;
      }
      setFetchState("allBalances", true);
      //This function returns non 0 balances for all the tokens, can be edited to show zero balance tokens as well based on all tokens you have ever interacted with
      const data = await alchemy.core.getTokenBalances(owner);
      const formatted = await Promise.all(
        data.tokenBalances
          .filter(
            (token) =>
              token.tokenBalance &&
              hexToBigInt(token.tokenBalance as `0x${string}`) > 0
          )
          .map(async (token) => {
            const metaData = await getMetaData(token.contractAddress);

            const balance = formatUnits(
              hexToBigInt(token.tokenBalance as `0x${string}`),
              metaData.decimals ?? 18
            );
            return {
              metaData,
              address: token.contractAddress,
              balance: Number(balance).toFixed(2),
            } as TokenData;
          })
      );

      setFetchState("allBalances", false);
      return formatted;
    },
    [alchemy, getMetaData]
  );

  const getTransaction = useCallback(
    async (hash: string) => {
        if (fetchRef.current?.allBalances === true) {
        return;
      }
      setFetchState("transaction", true);
      const response = await alchemy.core.getTransaction(hash);
      setFetchState("transaction", false);
      return response??undefined;
    },
    [alchemy]
  );

  return (
    <AlchemyContext.Provider
      value={{
        getMetaData,
        getBalance,
        getAllBalances,
        getTransaction,
        isFetchingAlchemy: isFetching,
        fetchStates,
      }}
    >
      {children}
    </AlchemyContext.Provider>
  );
};

export default AlchemyProvider;
