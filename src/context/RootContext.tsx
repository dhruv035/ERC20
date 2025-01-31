"use client";

import "@rainbow-me/rainbowkit/styles.css";
import React, { ReactNode, useContext } from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
  lightTheme,
  Chain,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, cookieStorage, createStorage } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import TransactionProvider, { TransactionContext } from "./TransactionContext";
import ChainProvider, { WalletContext } from "./WalletContext";
import ToastProvider, { ToastContext } from "./ToastContext";
import { LazyMotion, domAnimation } from "framer-motion";
import AlchemyProvider, { AlchemyContext } from "./AlchemyProvider";

// Setup queryClient
const customSepolia = { ...sepolia } as Chain;
const customMainnet = { ...mainnet } as Chain;
customSepolia.rpcUrls = {
  default: {
    http: [
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY}`,
    ],
  },
};
customMainnet.rpcUrls = {
  default: {
    http: [
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY}`,
    ],
  },
};

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  multiInjectedProviderDiscovery: true, 
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
  chains: [customSepolia, customMainnet],
  storage: createStorage({
    storage: cookieStorage,
  }),

  ssr: true, //Cookies and SSR to avoid hydration error on nextjs
});
export function ContextProvider({
  isDark,
  children,
}: {
  isDark: boolean;
  children: ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <LazyMotion features={domAnimation}>
      <ToastProvider>
        <WagmiProvider config={config} reconnectOnMount={true}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider showRecentTransactions={true} theme={isDark ? darkTheme() : lightTheme()}>
        <AlchemyProvider>
                <ChainProvider>
                  <TransactionProvider>{children}</TransactionProvider>
                </ChainProvider>
        </AlchemyProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
            </WagmiProvider>
      </ToastProvider>
    </LazyMotion>
  );
}

export const useWalletContext = () => useContext(WalletContext);
export const useToast = () => useContext(ToastContext);

export const useTransactionContext = () => useContext(TransactionContext);
export const useAlchemyContext = () => useContext(AlchemyContext);