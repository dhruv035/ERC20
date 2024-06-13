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
import { shortenHash } from "../actions/utils";
import { useToast } from "./RootContext";
import useAlchemyHooks from "../actions/useAlchemyHooks";
import { getPendingBlock, getPendingHash, unsetPendingBlock, unsetPendingHash } from "../actions/localStorage/pendingState";

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
  const [pendingState, setPendingState] = useState<PendingState>({
    isTxDisabled: false,
  } as PendingState);
  const { chain } = useAccount();

  const { data: blockNumber } = useBlockNumber({
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });
  const { getTransaction: getAlchemyTransaction } = useAlchemyHooks();

  const blockRef = useRef<bigint>();
  const pendingStateRef = useRef<PendingState>();

  pendingStateRef.current = pendingState;
  blockRef.current = blockNumber;

  const pendingTxLocal =
    typeof window !== "undefined"
      ? getPendingHash()
      : undefined;

  const localBlockNumber =
    typeof window !== "undefined"
      ? getPendingBlock()
      : undefined;
  //Watch transaction status if there's a hash pending
  const { data, status, error } = useWaitForTransactionReceipt({
    hash: pendingStateRef.current.pendingTx,
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
      8000,
    );
    unsetPendingHash();
    unsetPendingBlock();
    setPendingState({ isTxDisabled: false } as PendingState);
  }, [
    chain?.blockExplorers?.default?.url,
    openToast,
    pendingState.pendingTx,
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
      handleSuccess();
    } else if (status === "error") {
      handleError();
    }
  }, [status, handleSuccess, handleError]);

  //Handle localStorage updates here
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "pendingTx") {
        if (event.newValue !== null)
          setPendingState((prevState) => ({
            ...prevState,
            pendingTx:
              event.newValue !== null
                ? (event.newValue as `0x${string}`)
                : undefined,
          }));
        if (
          event.newValue !== null &&
          (event.newValue as `0x${string}`) !==
            pendingStateRef.current?.pendingTx
        ) {
          openToast(
            {
              title: "Transaction Detected",
              type:
                event.oldValue !== null ? ToastTypes.ALERT : ToastTypes.SUCCESS,
              message: `New ${
                event.oldValue !== null ? "replace" : ""
              } transaction added to the watcher. Hash is ${event.newValue}`,
              urlText: "View in Explorer",
              url: `https://etherscan.com/tx/${event.newValue}`,
            },
            6000,
          );
        }
      } else if (event.key === "pendingBlock") {
        if (event.newValue !== null)
          setPendingState((prevState) => ({
            ...prevState,
            pendingTxBlock:
              event.newValue !== null ? BigInt(event.newValue) : undefined,
          }));
      }
    };
    addEventListener("storage", handleStorage);
    return () => {
      removeEventListener("storage", handleStorage);
    };
  }, [openToast]);

  const handleAlchemy = useCallback(async () => {
    if (!pendingState.pendingTx) return;
    const result = await getAlchemyTransaction(pendingState.pendingTx);
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
  }, [pendingState.pendingTx, getAlchemyTransaction]);
  //Update PendingState when pendingTx hash changes
  useEffect(() => {
    if (pendingState.pendingTx) {
      if (pendingTxLocal) handleAlchemy();
      //This function is used to fetch transaction because alchemy will find transaction even if they were not included in a block (Since the tx was sent originally by Alchemy RPC)
      //We use this function to fetch gas fee paid and nonce for a stuck transaction
    } else {
      if (pendingTxLocal && pendingTxLocal !== "") {
        setPendingState((prevState) => ({
          ...prevState,
          pendingTx: pendingTxLocal as `0x${string}`,
        }));
      } else {
        setPendingState((prevState) => ({
          ...prevState,
          isTxDisabled: false,
        }));
      }
    }
  }, [pendingTxLocal, pendingState.pendingTx, handleAlchemy]);

  //Update pendingTxBlock, kept seperate to avoid unnecessary refetch
  useEffect(() => {
    if (!pendingState.pendingTxBlock) {
      if (localBlockNumber && localBlockNumber !== null) {
        setPendingState((prevState) => ({
          ...prevState,
          pendingTxBlock: BigInt(localBlockNumber),
        }));
      }
    }
  }, [localBlockNumber, pendingState.pendingTxBlock]);

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
