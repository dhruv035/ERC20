"use client";
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

import { useWaitForTransactionReceipt } from "wagmi";
import { ToastTypes } from "./ToastContext";
import { shortenHash } from "../actions/utils";
import { useAlchemyContext, useChainContext, useToast } from "./RootContext";

/*This is the bridge for any transactions to go through, it's disabled by isTxDisabled if there is data loading or if 
  there's a pending transaction. The data loading is enforced to ensure no transaction is done without latest data.
  Add pendingStates from any critical data here and add it in the subsequent hooks
*/
//Possible Updates:
//Make transactions accepted only after 2 confirmations

export type TransactionContextType = {
  pendingState: PendingState;
  setPendingState: Dispatch<SetStateAction<PendingState>>;
};

export type PendingState = {
  isTxDisabled: boolean;
  pendingTx: `0x${string}` | undefined;
  pendingTxBlock: bigint | undefined;
  maxFee: bigint | undefined;
  maxPriorityFee: bigint | undefined;
  to: string | undefined;
  data: string | undefined;
  nonce: number | undefined;
};
export type Deployment = {
  address: string;
  j1: string;
  j2?: string;
};
export const TransactionContext = createContext<TransactionContextType>(
  {} as TransactionContextType
);
const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { open: openToast } = useToast();

  const [pendingState, setPendingState] = useState<PendingState>({
    isTxDisabled: false,
  } as PendingState);
  const { blockNumber, chain, isFetchingChain } = useChainContext();

  const { getTransaction: getAlchemyTransaction, isFetchingAlchemy } =
    useAlchemyContext();
  const blockRef = useRef<bigint>();
  const pendingStateRef = useRef<PendingState>();

  pendingStateRef.current = pendingState;
  blockRef.current = blockNumber;

  const pendingTxLocal =
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("pendingTx")) ??
    undefined;

  //Watch transaction status if there's a hash pending
  const {
    status,
    error,
    isFetching: isFetchingTransaction,
  } = useWaitForTransactionReceipt({
    hash: pendingState.pendingTx as `0x${string}`,
  });
  //Update UI on transaction state changes

  const handleSuccess = useCallback(() => {
    openToast(
      {
        title: "Transaction Mined",
        type: ToastTypes.SUCCESS,
        message:
          "Transaction executed. the hash for transaction is " +
          shortenHash(pendingState.pendingTx as string),
        url:
          chain?.blockExplorers?.default?.url + `/tx/${pendingState.pendingTx}`,
        urlText: "View in Explorer",
      },
      8000
    );
    setPendingState({ isTxDisabled: false } as PendingState);
    localStorage.setItem("pendingTx", "");
    localStorage.setItem("pendingBlock", "");
  }, [chain?.blockExplorers?.default?.url, openToast, pendingState.pendingTx]);

  const handleError = useCallback(() => {
    if (!error)
      openToast(
        {
          title: "Transaction Error",
          type: ToastTypes.ERROR,
          message: "Transaction Failed",
        },
        6000
      );
    else
      openToast(
        {
          title: "Transaction Error",
          type: ToastTypes.ERROR,
          message: error.message,
        },
        6000
      );
  }, [openToast, error]);
  useEffect(() => {
    if (status === "success") {
      handleSuccess();
    } else if (status === "error") {
      handleError();
    }
  }, [status, handleSuccess, handleError]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "pendingTx") {
        if (pendingState) console.log("PendingStateEvent");
        if (
          event.newValue!=="" &&
          (event.newValue as `0x${string}`) !==
          pendingStateRef.current?.pendingTx
        )
         {
           setPendingState((prevState) => ({
            ...prevState,
            pendingTx: event.newValue as `0x${string}`,
          }));

          openToast(
            {
              title: "Transaction Detected",
              type: ToastTypes.SUCCESS,
              message: `New transaction added to the watcher. Hash is ${event.newValue}`,
              urlText:"View in Explorer",
              url:`https://etherscan.com/tx/${event.newValue}`
            },
            6000
          );
        }
      }
    };
    addEventListener("storage", (event) => {
      handleStorage(event);
    });
    return () => {
      removeEventListener("storage", handleStorage);
    };
  }, []);
  //Update PendingState when pendingTx hash changes
  useEffect(() => {
    if (pendingState.pendingTx) {
      //This function is used to fetch transaction because alchemy will find transaction even if they were not included in a block (Since the tx was sent originally by Alchemy RPC)
      //We use this function to fetch gas fee paid and nonce for a stuck transaction
      getAlchemyTransaction(pendingState.pendingTx).then((result) => {
        if (!result) return;
        setPendingState((prevState) => ({
          ...prevState,
          maxFee: result.maxFeePerGas?.toBigInt(),
          maxPriorityFee: result.maxPriorityFeePerGas?.toBigInt(),
          data: result.data,
          to: result.to,
          nonce: result.nonce,
          isTxDisabled: true,
        }));
      });
    } else {
      if (pendingTxLocal && pendingTxLocal !== "") {
        setPendingState((prevState) => ({
          ...prevState,
          pendingTx: pendingTxLocal as `0x${string}`,
        }));
      } else {
        if (!isFetchingAlchemy && !isFetchingTransaction && !isFetchingChain)
          setPendingState((prevState) => ({
            ...prevState,
            isTxDisabled: false,
          }));
      }
    }
  }, [
    pendingState.pendingTx,
    getAlchemyTransaction,
    isFetchingAlchemy,
    isFetchingTransaction,
    isFetchingChain,
  ]);

  //Update pendingTxBlock, kept seperate to avoid unnecessary refetch
  useEffect(() => {
    if (!pendingState.pendingTxBlock) {
      const blockNumber = localStorage.getItem("pendingBlock");
      if (blockNumber && blockNumber !== "") {
        setPendingState((prevState) => ({
          ...prevState,
          pendingTxBlock: BigInt(blockNumber),
        }));
      }
    }
  }, [pendingState.pendingTxBlock]);

  //Takes data from pendingState maintained in the context to send a replacement transaction

  return (
    <TransactionContext.Provider
      value={{
        pendingState,
        setPendingState,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
export default TransactionProvider;
