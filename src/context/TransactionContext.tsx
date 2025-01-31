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

import {
  useAccount,
  useBlockNumber,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ToastTypes } from "./ToastContext";
import { shortenHash } from "../lib/utils";
import { useAlchemyContext, useToast } from "./RootContext";
import {
  getPendingStateLocal,
  setPendingStateLocal,
  unsetPendingStateLocal,
} from "../lib/localStorage/pendingState";
import { PendingState } from "@/lib/types";

/*This is the bridge for any transactions to go through, it's disabled by isTxDisabled if there is data loading or if 
  there's a pending transaction. The data loading is enforced to ensure no transaction is done without latest data.
  Add pendingStates from any critical data here and add it in the subsequent hooks
*/
//Possible Updates:
//Make transactions accepted only after 2 confirmations

export type TransactionContextType = {
  pendingState: PendingState | undefined;
  setPendingState: Dispatch<SetStateAction<PendingState | undefined>>;
};

export const TransactionContext = createContext<TransactionContextType>(
  {} as TransactionContextType,
);
const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { open: openToast } = useToast();

  const openRef = useRef<
    (
      data: {
        title: string;
        type: ToastTypes;
        message: string;
        url?: string | undefined;
        urlText?: string | undefined;
      },
      timeout: number,
    ) => void
  >();
  openRef.current = openToast;
  const [pendingState, setPendingState] = useState<PendingState>();
  const { chain } = useAccount();

  const { data: blockNumber } = useBlockNumber({
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });
  const { alchemy } = useAlchemyContext();

  const blockRef = useRef<bigint>();
  const pendingStateRef = useRef<PendingState>();

  pendingStateRef.current = pendingState;
  blockRef.current = blockNumber;

  //Watch transaction status if there's a hash pending
  const { data, status, error } = useWaitForTransactionReceipt({
    hash: pendingStateRef?.current?.pendingTx,
  });
  //Update UI on transaction state changes
  useEffect(() => {
    console.log("Pending State", pendingState);
    if (pendingState) setPendingStateLocal(pendingState);
    const pendingStateLocal = getPendingStateLocal();
    console.log("Pending State Local", pendingStateLocal);
  }, [pendingState]);
  useEffect(() => {
    const pendingStateLocal = getPendingStateLocal();
    console.log("Pending State Local", pendingStateLocal);
    if (pendingStateLocal) {
      setPendingState(pendingStateLocal);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    openToast(
      {
        title: pendingState?.pendingTx!==data?.transactionHash ? "Transaction Replaced" : "Transaction Mined",
        type: ToastTypes.SUCCESS,
        message:
          "Transaction executed. the hash for transaction is " +
          shortenHash(data?.transactionHash as string),
        url:
          chain?.blockExplorers?.default?.url +
          `/tx/${data?.transactionHash}`,
        urlText: "View in Explorer",
      },
      8000,
    );
    unsetPendingStateLocal();
    setPendingState(undefined);
  }, [
    chain?.blockExplorers?.default?.url,
    openToast,
    data?.transactionHash,
    setPendingState,
  ]);

  const handleError = useCallback(async () => {
    if (!error) return;

    openToast(
      {
        title: "Transaction Error",
        type: ToastTypes.ERROR,
        message: error.message,
      },
      6000,
    );
  }, [openToast, error]);

  //Side Effects

  useEffect(() => {
    if (status === "success") {
      console.log("Success data", data);
      handleSuccess();
    } else if (status === "error") {
      handleError();
    }
  }, [status, handleSuccess, handleError]);

  //Handle localStorage updates here
  const handleStorage = useCallback(
    (event: StorageEvent) => {
      if (event.key === "pendingState") {
        if (event.newValue === null) {
          setPendingState(undefined);
          return;
        }
        const newPendingState = JSON.parse(event.newValue as string);
        const oldPendingState = pendingStateRef.current;
        if (newPendingState.pendingTx !== oldPendingState?.pendingTx) {
          openToast(
            {
              title: "Transaction Detected",
              type:
                event.oldValue !== null ? ToastTypes.ALERT : ToastTypes.SUCCESS,
              message: `New ${
                event.oldValue !== null ? "replace" : ""
              } transaction added to the watcher. Hash is ${newPendingState.pendingTx}`,
              urlText: "View in Explorer",
              url: `https://etherscan.com/tx/${newPendingState.pendingTx}`,
            },
            6000,
          );
        }
        setPendingState(newPendingState);
      }
    },
    [setPendingState],
  );

  useEffect(() => {
    addEventListener("storage", handleStorage);
    return () => {
      removeEventListener("storage", handleStorage);
    };
  }, [handleStorage]);
  //Update PendingState when pendingTx hash changes
  // useEffect(() => {
  //   if (pendingStateLocal) {
  //     setPendingState(pendingStateLocal)
  //   } else {
  //     setPendingState({
  //       isTxDisabled: false,
  //     } as PendingState)
  //   }
  // }, [pendingStateLocal]);

  useEffect(() => {
    if (pendingState?.pendingTx)
      alchemy.core.getTransaction(pendingState.pendingTx).then((result) => {
        if (!result) return;

        setPendingState((prevState) => {
          const state = {
            maxFee: result.maxFeePerGas?.toBigInt(),
            maxPriorityFee: result.maxPriorityFeePerGas?.toBigInt(),
            data: result.data,
            to: result.to,
            nonce: result.nonce,
            isTxDisabled: true,
          };
          if (prevState)
            return {
              ...prevState,
              ...state,
            };
          return { ...state } as PendingState;
        });
      });
  }, [pendingState?.pendingTx]);
  //Update pendingTxBlock, kept seperate to avoid unnecessary refetch
  useEffect(() => {
    const pendingStateLocal = getPendingStateLocal();
    if (!pendingState?.pendingTxBlock) {
      if (pendingStateLocal && pendingStateLocal.pendingTxBlock !== undefined) {
        setPendingState((prevState) => {
          if (prevState)
            return {
              ...prevState,
              pendingTxBlock: pendingStateLocal.pendingTxBlock,
            };
          return {
            pendingTxBlock: pendingStateLocal.pendingTxBlock,
          } as PendingState;
        });
      }
    }
  }, [pendingState?.pendingTxBlock]);

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
