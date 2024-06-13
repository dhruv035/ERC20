"use  client";
import { NextPage } from "next";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useAccountEffect,
  useReconnect,
} from "wagmi";
import { useToast } from "./RootContext";
import { ToastTypes } from "./ToastContext";

//Global contexts may be persisted and managed here

export type ChainContextType = {
  isConnected: boolean;
  gasSettings: GasSettings;
  setGasSettings: Dispatch<SetStateAction<GasSettings>>;
};

export type GasSettings = {
  isDisabled: boolean;
  maxPriorityFee: string;
  maxFee: string;
};

export const ChainContext = createContext<ChainContextType>(
  {} as ChainContextType,
);

const ChainProvider: NextPage<{ children: ReactNode }> = ({ children }) => {
  const [gasSettings, setGasSettings] = useState<GasSettings>({
    isDisabled: true,
    maxPriorityFee: "",
    maxFee: "",
  });

  const { reconnect } = useReconnect();
  const { open: openToast } = useToast();
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
    [openToast, reconnect],
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    addEventListener("storage", handleConnectEvent);
    return () => {
      removeEventListener("storage", handleConnectEvent);
    };
  }, [handleConnectEvent]);
  //Block Countdown

  return (
    <ChainContext.Provider
      value={{
        isConnected,
        gasSettings,
        setGasSettings,

      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

export default ChainProvider;
