"use  client";
import { NextPage } from "next";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
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
  getMetaData: (
    tokenAddress: string
  ) => Promise<TokenMetadataResponse | undefined>;
  getTokenData: (tokenAddress: string) => Promise<TokenData | undefined>;
  getAllTokenData: () => Promise<TokenData[] | undefined>;
  getTransaction: (hash: string) => Promise<TransactionResponse | undefined>;
  isFetchingAlchemy: boolean;
  fetchStates: FetchStates;
  initializeStates:FetchStates;
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

  const [initializeStates, setInitializeState] = useState<FetchStates>({
    metaData: false,
    balance: false,
    allBalances: false,
    transaction: false,
  });

  const alchemy = useMemo(() => {
    const settings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA,
      network: chain?.id
        ? chain?.id === 1
          ? Network.ETH_MAINNET
          : Network.ETH_SEPOLIA
        : undefined, // Expand with a chainId to alchemy network mapping
    };
    return new Alchemy(settings);
  }, [chain?.id]);

  const isFetching = useMemo<boolean>(() => {
    let flag = Object.values(fetchStates).every((state) => {
      state !== true;
    });
    if (flag) return true;
    else return false;
  }, [fetchStates]);

  const setFetchState = (type: keyof FetchStates, state: boolean) => {
    setFetchStates((prevState) => ({ ...prevState, [type]: state }));
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
        setInitializeState((prevState) => ({ ...prevState, metaData: true }));
      }
      return response;
    },
    [alchemy]
  );

  useEffect(() => {
    setInitializeState({
      metaData: false,
      balance: false,
      allBalances: false,
      transaction: false,
    });
  }, [address]);
  const getTokenData = useCallback(
    async (tokenAddress: string) => {
      if (fetchRef.current?.balance === true) {
        return;
      }
      const metaData = await getMetaData(tokenAddress);

      setFetchState("balance", true);
      const addresses = [tokenAddress];
      const res = await alchemy.core.getTokenBalances(
        address as string,
        addresses
      );

      const response = res.tokenBalances[0];

      const balance = formatUnits(
        hexToBigInt(response.tokenBalance as `0x${string}`),
        metaData.decimals ?? 9
      );
      const tokenData = {
        metaData,
        address: tokenAddress,
        balance,
      } as TokenData;
      setFetchState("balance", false);
      if (initializeRef.current?.balance === false) {
        setInitializeState((prevState) => ({ ...prevState, balance: true }));
      }
      return tokenData;
    },
    [alchemy, address, getMetaData]
  );

  const fetchingRef = useRef<boolean>();
  fetchingRef.current = isFetching;

  const getAllTokenData = useCallback(async () => {
    if (fetchRef.current?.allBalances === true) {
      return;
    }
    setFetchState("allBalances", true);
    //This function returns non 0 balances for all the tokens, can be edited to show zero balance tokens as well based on all tokens you have ever interacted with
    const data = await alchemy.core.getTokenBalances(address as `0x${string}`);
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
            metaData.decimals ?? 6
          );
          return {
            metaData,
            address: token.contractAddress,
            balance,
          } as TokenData;
        })
    );

    setFetchState("allBalances", false);
    if (initializeRef.current?.allBalances === false) {
      setInitializeState((prevState) => ({ ...prevState, allBalances: true }));
    }
    return formatted;
  }, [alchemy, getMetaData, address]);

  const getTransaction = useCallback(
    async (hash: string) => {
      if (fetchRef.current?.allBalances === true) {
        return;
      }
      setFetchState("transaction", true);
      const response = await alchemy.core.getTransaction(hash);
      setFetchState("transaction", false);

      if (initializeRef.current?.transaction === false) {
        setInitializeState((prevState) => ({
          ...prevState,
          transaction: true,
        }));
      }

      return response ?? undefined;
    },
    [alchemy]
  );

  return (
    <AlchemyContext.Provider
      value={{
        getMetaData,
        getTokenData,
        getAllTokenData,
        getTransaction,
        isFetchingAlchemy: isFetching,
        fetchStates,
        initializeStates,
      }}
    >
      {children}
    </AlchemyContext.Provider>
  );
};

export default AlchemyProvider;
