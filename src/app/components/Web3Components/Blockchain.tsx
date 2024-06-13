import { useTimerContext } from "@/app/context/RootContext";
import { formatGwei } from "viem";
import { useBlockNumber, useGasPrice } from "wagmi";

const Blockchain = ({}: {}) => {
  const { data: gasPrice } = useGasPrice({
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });
  const {data:blockNumber} = useBlockNumber({query:{staleTime:1_000, refetchInterval:1_000}});
  const { timer } = useTimerContext();

  return (
    <div className="flex w-full flex-col items-center px-2 text-text">
      <p className="my-4 mb-4 text-3xl text-accent">Monitor Chain</p>
      <table className="w-fit">
        <tbody>
          <tr className="">
            <td className="text-md flex flex-row px-2 sm:text-xl">
              {" "}
              Current Block{" "}
            </td>
            <td className="text-md px-2 text-accent sm:text-xl">
              : {blockNumber?.toString()}
            </td>
          </tr>
          <tr className="">
            <td className="text-md flex flex-row px-2 sm:text-xl">
              Next block in
            </td>
            <td className="text-md ml-2 px-2 text-accent sm:text-xl">
              : {timer}
            </td>
          </tr>
          <tr>
            <td className="text-md flex w-min flex-row px-2 sm:text-xl">
              Current base fee(Estimate){" "}
            </td>
            <td className="text-md ml-2 px-2 text-accent sm:text-xl">
              : {gasPrice && Number(formatGwei(gasPrice)).toFixed(3)} Gwei
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-row">
        <p className="ml-2 text-accent"></p>
      </div>
    </div>
  );
};

export default Blockchain;
