"use  client";
import { Network, Alchemy } from "alchemy-sdk";
import { NextPage } from "next";
import { ReactNode, createContext, useMemo } from "react";
import { useAccount } from "wagmi";
//Global contexts may be persisted and managed here

export type AlchemyContextType = {
  alchemy: Alchemy;
};

export const AlchemyContext = createContext<AlchemyContextType>(
  {} as AlchemyContextType,
);

const AlchemyProvider: NextPage<{ children: ReactNode }> = ({ children }) => {
  const { chainId } = useAccount();
  const alchemy = useMemo(() => {
    const settings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY,
      network: chainId
        ? chainId === 1
          ? Network.ETH_MAINNET
          : Network.ETH_SEPOLIA
        : undefined, // Expand with a chainId to alchemy network mapping
    };
    return new Alchemy(settings);
  }, [chainId]);
  return (
    <AlchemyContext.Provider
      value={{
        alchemy,
      }}
    >
      {children}
    </AlchemyContext.Provider>
  );
};

export default AlchemyProvider;
