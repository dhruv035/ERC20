import { formatGwei } from "viem";
import {
  useChainContext,
  useTimerContext,
  useTransactionContext,
} from "@/app/context/RootContext";
import useERC20 from "@/app/actions/erc20Hooks";

const PendingTransaction = () => {
  const { chain, gasPrice, blockNumber } = useChainContext();
  const { timer } = useTimerContext();
  const { pendingState } = useTransactionContext();
  const { sendReplace } = useERC20();

  const { pendingTx, pendingTxBlock, maxFee, maxPriorityFee } = pendingState;
  if (pendingTx)
    return (
      <div className="my-8 w-full max-w-[400px] rounded-[10px] bg-[rgba(255,255,255,0.04)] p-4 text-accent shadow-fuller shadow-accent">
        <p className="mb-4 overflow-hidden text-center text-2xl text-accent">
          You have a pending Transaction
        </p>
        <div className="flex flex-row justify-center text-center text-text">
          Current Block :{" "}
          <p className="text-accent">{blockNumber?.toString()}</p>
        </div>
        <div className="flex flex-row justify-center text-center text-text">
          Next Block in : <p className="text-accent">{timer}</p>
        </div>

        <div className="overflow-hidden text-text">
          <p className="my-4 text-center text-xl text-accent">
            {" "}
            Pending Tx Details
          </p>
          <p className="break-all">
            Hash:{" "}
            <u className="break-all transition duration-200 ease-in-out hover:cursor-pointer hover:text-accent">
              <a
                href={
                  chain?.blockExplorers?.default?.url +
                  `/tx/${pendingState.pendingTx}`
                }
                target="_blank"
              >
                {pendingTx}
              </a>
            </u>
          </p>
          <p>Block Sent: {pendingTxBlock?.toString()}</p>
          <div>
            Max Fee:{" "}
            {maxFee ? formatGwei(maxFee).toString() + " Gwei" : "Unknown"}{" "}
          </div>
          <p>
            Max Priority Fee:{" "}
            {maxPriorityFee
              ? formatGwei(maxPriorityFee).toString() + " Gwei"
              : "Unknown"}
          </p>
          <div className="flex flex-col items-center text-accent">
            {Number(gasPrice) > Number(maxFee) - Number(maxPriorityFee) ? (
              <p
                className="hover:cursor-pointer hover:underline"
                onClick={() => {
                  sendReplace();
                }}
              >
                Fee too low, click here to speed up transaction
              </p>
            ) : blockNumber &&
              pendingTxBlock &&
              Number(blockNumber) - Number(pendingTxBlock) < 3 ? (
              <p>
                Transaction should go through in 15-30 seconds {`(1-2 blocks)`}
              </p>
            ) : (
              <p
                className="hover:cursor-pointer hover:underline"
                onClick={() => {
                  sendReplace();
                }}
              >
                Transaction seems stuck in the pool, click here to speed up
                transaction
              </p>
            )}
          </div>
        </div>
      </div>
    );
};

export default PendingTransaction;
