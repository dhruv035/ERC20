import { useChainContext, useTimerContext } from "@/app/context/RootContext";
import { formatGwei } from "viem";

const Blockchain = ({}: {}) => {
  const { gasPrice, blockNumber } = useChainContext();
  const {timer} = useTimerContext();

  return (
    <div className="flex flex-col text-text w-full items-center px-2">
      <p className="my-4 text-3xl text-accent mb-4">Monitor Chain</p>
      <table className="w-fit ">
        <tbody>
          <tr className="">
            <td className="flex flex-row text-md sm:text-xl px-2">
              {" "}
              Current Block{" "}
            </td>
            <td className="text-accent text-md sm:text-xl px-2">
              : {blockNumber?.toString()}
            </td>
          </tr>
          <tr className="">
            <td className="flex flex-row text-md sm:text-xl px-2">
              Next block in
            </td>
            <td className="text-accent text-md sm:text-xl ml-2 px-2">
              : {timer}
            </td>
          </tr>
          <tr>
            <td className="w-min flex flex-row text-md sm:text-xl px-2">
              Current base fee(Estimate){" "}
            </td>
            <td className="text-accent text-md sm:text-xl ml-2 px-2">
              : {gasPrice && Number(formatGwei(gasPrice)).toFixed(3)} Gwei
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-row">
        <p className="text-accent ml-2"></p>
      </div>
    </div>
  );
};

export default Blockchain;
