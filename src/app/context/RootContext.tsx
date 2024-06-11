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
import ChainProvider, { ChainContext } from "./ChainContext";
import ToastProvider, { ToastContext } from "./ToastContext";
import TimerProvider, { TimerContext } from "./TimerContext";
import { LazyMotion, domAnimation } from "framer-motion";

// Setup queryClient
const customSepolia = { ...sepolia } as Chain;
const customMainnet = { ...mainnet } as Chain;
customSepolia.rpcUrls = {
  default: {
    http: [
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA}`,
    ],
  },
};
customMainnet.rpcUrls = {
  default: {
    http: [
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MAINNET}`,
    ],
  },
};

//The task being front end I
export const config = getDefaultConfig({
  appName: "My RainbowKit App",
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
            <RainbowKitProvider theme={isDark ? darkTheme() : lightTheme()}>
              <TimerProvider>
                <ChainProvider>
                    <TransactionProvider>{children}</TransactionProvider>
                </ChainProvider>
              </TimerProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ToastProvider>
    </LazyMotion>
  );
}

export const useChainContext = () => useContext(ChainContext);
export const useToast = () => useContext(ToastContext);
export const useTransactionContext = () => useContext(TransactionContext);
export const useTimerContext = () => useContext(TimerContext);