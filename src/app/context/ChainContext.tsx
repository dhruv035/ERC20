"use  client";
import { NextPage } from "next";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Connector,
  useAccount,
  useAccountEffect,
  useBlockNumber,
  useConfig,
  useConnect,
  useConnectorClient,
  useDisconnect,
  useEstimateFeesPerGas,
  useGasPrice,
  useReconnect,
} from "wagmi";
import { Chain } from "viem";
import { connect } from "wagmi/actions";
import { useToast } from "./RootContext";
import { ToastTypes } from "./ToastContext";
import { useRouter } from "next/navigation";

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
  {} as ChainContextType,
);

interface ExtendedConnector extends Connector {
  id: string;
  name: string;
  iconBackground?: string;
  qrCode?: object;
  iconUrl?: () => string;
  rkDetails?: {
    id: string;
    name: string;
    iconBackground: string;
    qrCode: object;
    iconUrl: () => string;
  };
}

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

  const { connect, connectors } = useConnect();
  const { reconnect } = useReconnect();
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { open: openToast } = useToast();
  const connectorsRef = useRef<readonly Connector[]>();
  connectorsRef.current = connectors;
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
      setIsConnected(true);
      localStorage.setItem("isConnected", "true");
    },
    onDisconnect() {
      setIsConnected(false);
      localStorage.setItem("isConnected", "false");
    },
  });

  const handleConnectEvent = useCallback(
    (event: StorageEvent) => {
      console.log("isConnectedEvent");
      if (event.key === "isConnected") {
        if (event.newValue === "true") {
          reconnect();
          openToast(
            {
              title: "New connection",
              type: ToastTypes.ALERT,
              message: "A new wallet connection was detected. Updating page",
            },
            5000,
          );
        } else {
          openToast(
            {
              title: "Connector removed",
              type: ToastTypes.ALERT,
              message: "Wallet connection removed. Reloading page",
            },
            5000,
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        //window.location.reload();
      }
    },
    [connectors, disconnect, openToast, reconnect, openToast, address],
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    addEventListener("storage", handleConnectEvent);
    return () => {
      console.log("Removing storage event listener");
      removeEventListener("storage", handleConnectEvent);
    };
  }, [handleConnectEvent]);
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
