"use  client";
import { NextPage } from "next";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import {
  useAccount,
  useAccountEffect,
  useBlockNumber,
  useConfig,
  useConnect,
  useConnectorClient,
  useEstimateFeesPerGas,
  useGasPrice,
} from "wagmi";
import { Chain } from "viem";
import { connect } from "wagmi/actions";

//Global contexts may be persisted and managed here

export type ChainContextType = {
  chain: Chain | undefined;
  blockNumber: bigint | undefined;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  gasSettings: GasSettings;
  setGasSettings: Dispatch<SetStateAction<GasSettings>>;
  gasEstimate?: {
    gasPrice?: undefined;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    formatted: {
      gasPrice?: undefined;
      maxFeePerGas: string;
      maxPriorityFeePerGas: string;
    };
  };
  gasPrice: bigint | undefined;
  isFetchingChain: boolean;
};

export type GasSettings = {
  isDisabled: boolean;
  maxPriorityFee: string;
  maxFee: string;
};

export const ChainContext = createContext<ChainContextType>(
  {} as ChainContextType
);

const ChainProvider: NextPage<{ children: ReactNode }> = ({ children }) => {
  const [gasSettings, setGasSettings] = useState<GasSettings>({
    isDisabled: true,
    maxPriorityFee: "",
    maxFee: "",
  });
  const { address, chain } = useAccount();

  //Inv
  const blockNumber = useBlockNumber({
    watch: true,
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const config = useConfig();
  const { data: gasPrice, isFetching: isFetchingPrice } = useGasPrice({
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });
  const { data: gasEstimate, isFetching: isFetchingEstimate } =
    useEstimateFeesPerGas({
      formatUnits: "gwei",
      query: {
        enabled: !gasSettings.isDisabled,
        staleTime: 1_000,
        refetchInterval: 1_000,
      },
    });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useAccountEffect({
    onConnect() {
      console.log("ASD");
      setIsConnected(true);
      localStorage.setItem("isConnected", "true");
    },
    onDisconnect() {
      console.log("GASD");
      setIsConnected(false);
      localStorage.setItem("isConnected", "false");
    },
  });

  useEffect(() => {
    const handleConnect = (event: StorageEvent) => {
      if (event.key === "isConnected") {
        console.log("isConnected event");
        setIsConnected(event.newValue === "true");
        window.location.reload();
      }
    };
    addEventListener("storage", (event) => {
      handleConnect(event);
    });
    return () => {
      removeEventListener("storage", handleConnect);
    };
  }, []);
  //Block Countdown

  useEffect(() => {
    if (isFetchingEstimate || isFetchingPrice) setIsFetching(true);
    else setIsFetching(false);
  }, [isFetchingEstimate, isFetchingPrice]);
  return (
    <ChainContext.Provider
      value={{
        chain,
        blockNumber: blockNumber.data,
        address,
        isConnected,
        gasSettings,
        setGasSettings,
        gasEstimate: gasEstimate,
        gasPrice,
        isFetchingChain: isFetching,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

export default ChainProvider;
