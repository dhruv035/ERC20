import { useCallback, useRef } from "react";
import {
  useChainContext,
  useToast,
  useTransactionContext,
} from "../context/RootContext";
import { TokenData } from "../page";
import { writeContract } from "wagmi/actions";
import { useConfig, useSendTransaction } from "wagmi";
import {
  TransactionExecutionErrorType,
  erc20Abi,
  parseGwei,
  parseUnits,
} from "viem";
import { ToastTypes } from "../components/BaseComponents/Toast";
import { shortenHash } from "./utils";

const useERC20 = () => {
  const { gasSettings, chain, blockNumber } = useChainContext();
  const { pendingState, setPendingState } = useTransactionContext();
  const { sendTransaction } = useSendTransaction();

  const config = useConfig();
  const { open: openToast } = useToast();

  const blockRef = useRef<bigint>();
  blockRef.current = blockNumber;

  const sendReplace = () => {
    try {
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
              6000
            );
            setPendingState((prevState) => ({
              ...prevState,
              pendingTx: hash,
              pendingTxBlock: blockRef.current,
            }));
            localStorage.setItem("pendingTx", hash);
            blockRef.current &&
              localStorage.setItem(
                "pendingTxBlock",
                blockRef.current.toString()
              );
          },
        }
      );
    } catch (error) {}
  };

  const sendTokens = useCallback(
    async (token: TokenData, toAddress: `0x${string}`, amount: string) => {
      try {
        let hash = await writeContract(config, {
          __mode: "prepared", //To avoid having to send gas amount when setting fee manually. If gas left undefined metamask throws error saying insufficient gas provided since gas/gasLimit set is 0
          address: token.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [toAddress, parseUnits(amount, token.metaData.decimals)],
          type: "eip1559",
          maxFeePerGas: !gasSettings.isDisabled
            ? Number(gasSettings.maxFee) > 0
              ? BigInt(parseGwei(gasSettings.maxFee))
              : BigInt(parseGwei(gasSettings.maxPriorityFee))
            : undefined,
          maxPriorityFeePerGas: !gasSettings.isDisabled
            ? BigInt(parseGwei(gasSettings.maxPriorityFee))
            : undefined,
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
              `/tx/${pendingState.pendingTx}`,
            urlText: "View in Explorer",
          },
          6000
        );
        setPendingState((prevState) => ({
          ...prevState,
          pendingTx: hash,
          pendingTxBlock: blockRef.current,
        }));
        localStorage.setItem("pendingTx", hash);
        localStorage.setItem(
          "pendingBlock",
          blockRef.current ? blockRef.current.toString() : ""
        );
      } catch (error: any) {
        const e = error as TransactionExecutionErrorType;
        openToast(
          {
            title: e.name,
            type: ToastTypes.ERROR,
            message: e.shortMessage,
          },
          6000
        );
        throw e
      }
    },
    [
      chain?.blockExplorers?.default?.url,
      config,
      gasSettings,
      openToast,
      pendingState.pendingTx,
    ]
  );

  return {
    sendTokens,
    sendReplace,
  };
};

export default useERC20;
