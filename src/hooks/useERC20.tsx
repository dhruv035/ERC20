import { useCallback, useRef } from "react";
import { useToast, useTransactionContext } from "../context/RootContext";
import { GasSettings, PendingState, TokenData } from "@/lib/types";
import { writeContract } from "wagmi/actions";
import {
  useAccount,
  useBlockNumber,
  useConfig,
  useSendTransaction,
} from "wagmi";
import { TransactionExecutionErrorType, erc20Abi, parseUnits } from "viem";
import { ToastTypes } from "../components/BaseComponents/Toast";
import { formatGasData, shortenHash } from "../lib/utils";

const useERC20 = () => {
  const { chain } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const { pendingState, setPendingState } = useTransactionContext();
  const { sendTransaction } = useSendTransaction();

  const config = useConfig();
  const { open: openToast } = useToast();

  const blockRef = useRef<bigint>();
  blockRef.current = blockNumber;

  const sendReplace = () => {
    try {
      if (!pendingState?.nonce) {
        openToast(
          {
            title: "Error",
            type: ToastTypes.ERROR,
            message: "Cannot replace transaction - nonce not available",
          },
          6000,
        );
        return;
      }

      sendTransaction(
        {
          to: pendingState.to as `0x${string}`,
          data: pendingState.data as `0x${string}`,
          nonce: pendingState.nonce,
        },
        {
          onSuccess: (hash) => {
            openToast(
              {
                title: "Replace Transaction Sent",
                type: ToastTypes.ALERT,
                message:
                  "Your replacement transaction has been sent to the blockchain. Transaction hash is " +
                  shortenHash(hash as string),
                url: chain?.blockExplorers?.default?.url + `/tx/${hash}`,
                urlText: "View in Explorer",
              },
              6000,
            );
            setPendingState((prevState) => {
              if (prevState)
                return {
                  ...prevState,
                  pendingTx: hash,
                  pendingTxBlock: blockRef.current,
                  nonce: prevState.nonce
                };
              else
                return {
                  pendingTx: hash,
                  pendingTxBlock: blockRef.current,
                  nonce: pendingState.nonce,
                  isTxDisabled: true,
                } as PendingState;
            });
          },
        },
      );
    } catch (error) {
      const e = error as TransactionExecutionErrorType;
      openToast(
        {
          title: e.name,
          type: ToastTypes.ERROR,
          message: e.shortMessage,
        },
        6000,
      );
      throw e;
    }
  };

  const sendTokens = useCallback(
    async (
      token: TokenData,
      toAddress: `0x${string}`,
      amount: string,
      gasSettings: GasSettings,
    ) => {
      const gasData = formatGasData(gasSettings);
      try {
        let hash = await writeContract(config, {
          __mode: "prepared", //To avoid having to send gas amount when setting fee manually. If gas left undefined metamask throws error saying insufficient gas provided since gas/gasLimit set is 0
          address: token.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [toAddress, parseUnits(amount, token.metaData.decimals)],
          type: "eip1559",
          ...(gasData.maxFeePerGas && !gasSettings.isDisabled
            ? {
                ...gasData,
                maxPriorityFeePerGas: gasData.maxPriorityFeePerGas ?? BigInt(0),
              }
            : {}),
        });
        openToast(
          {
            title: "Transaction Sent",
            type: ToastTypes.SUCCESS,
            message:
              "Your transaction has been sent to the blockchain. Transaction hash is " +
              shortenHash(hash as string),
            url:
              chain?.blockExplorers?.default?.url +
              `/tx/${pendingState?.pendingTx}`,
            urlText: "View in Explorer",
          },
          6000,
        );
        setPendingState((prevState) => {
          if (prevState)
            return {
              ...prevState,
              pendingTx: hash,
              pendingTxBlock: blockRef.current,
              isTxDisabled: true,
            };
          else
            return {
              pendingTx: hash,
              pendingTxBlock: blockRef.current,
              isTxDisabled: true,
            } as PendingState;
        });
      } catch (error: any) {
        const e = error as TransactionExecutionErrorType;
        console.log("ERROR", e);
        openToast(
          {
            title: e.name,
            type: ToastTypes.ERROR,
            message: e.shortMessage,
          },
          6000,
        );
        throw e;
      }
    },
    [
      chain?.blockExplorers?.default?.url,
      config,
      openToast,
      pendingState?.pendingTx,
      setPendingState,
    ],
  );

  return {
    sendTokens,
    sendReplace,
  };
};

export default useERC20;
