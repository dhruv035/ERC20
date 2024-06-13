import { useState } from "react";
import Input from "../BaseComponents/Input";
import Accordion from "../BaseComponents/Accordion";
import { useToast, useChainContext } from "@/app/context/RootContext";
import { ToastTypes } from "../BaseComponents/Toast";
import { useEstimateFeesPerGas } from "wagmi";

const GasStation = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { gasSettings, setGasSettings } = useChainContext();
  const { data: gasEstimate, isFetching: isFetchingEstimate } =
  useEstimateFeesPerGas({
    formatUnits: "gwei",
    query: {
      enabled: !gasSettings.isDisabled,
      staleTime: 6_000,
      refetchInterval: 6_000,
    },
  });
  const { open: openToast } = useToast();
  return (
    <Accordion isOpen={isOpen} setIsOpen={setIsOpen} header="Gas Station">
      {
        <div
          className={`group flex flex-col justify-center overflow-hidden transition-all ${
            isOpen
              ? gasSettings.isDisabled
                ? "h-[40px]"
                : "h-[300px]"
              : "h-[0px]"
          }`}
        >
          <div className={`flex flex-row items-center`}>
            <p className="mr-4 w-full origin-left font-bold text-accent transition ease-in-out sm:w-fit">
              Use Metamask to set Gas Price
            </p>

            <input
              className="min-w-12 border-4 border-solid accent-amber-600"
              checked={gasSettings.isDisabled}
              type="checkbox"
              onChange={(e) => {
                setGasSettings((prevState) => {
                  return {
                    ...prevState,
                    isDisabled: !prevState.isDisabled,
                  };
                });
              }}
            />
          </div>

          {!gasSettings.isDisabled && (
            <div className="flex flex-col">
              <div className="flex w-full flex-col items-center">
                <p className="text-xl text-accent">Suggested Fee</p>
                <table className="w-full items-start">
                  <thead>
                    <tr className="text-accent">
                      <th>Max Fee</th>
                      <th>Max Priority Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center ">
                      <td
                        className={`hover:cursor-pointer hover:text-accent hover:underline ${isFetchingEstimate?"animate-pulse-fast text-red-600":""}`}
                        onClick={() => {
                          gasEstimate &&
                            setGasSettings((prevState) => ({
                              ...prevState,
                              maxFee: gasEstimate.formatted.maxFeePerGas,
                            }));
                        }}
                      >
                        {gasEstimate?.formatted.maxFeePerGas}
                      </td>
                      <td
                        onClick={() => {
                          gasEstimate &&
                            setGasSettings((prevState) => ({
                              ...prevState,
                              maxPriorityFee:
                                gasEstimate.formatted.maxPriorityFeePerGas,
                            }));
                        }}
                        className={`hover:cursor-pointer hover:text-accent hover:underline ${isFetchingEstimate?"animate-pulse-fast text-red-600":""}`}
                      >
                        {gasEstimate?.formatted.maxPriorityFeePerGas}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Input
                disabled={gasSettings.isDisabled}
                value={gasSettings.maxFee}
                onChange={(e) => {
                  setGasSettings((prevState) => {
                    return {
                      ...prevState,
                      maxFee: e.target.value,
                    };
                  });
                }}
                placeholder="0"
                className={`border-2px w-fit border-white bg-transparent text-xl text-accent`}
                label="Max Fee"
              />
              <Input
                disabled={gasSettings.isDisabled}
                value={gasSettings.maxPriorityFee}
                onChange={(e) => {
                  if (
                    Number(e.target.value) > Number(gasSettings.maxFee) &&
                    Number(gasSettings.maxFee) > 0
                  ) {
                    openToast(
                      {
                        title: "Input Error",
                        type: ToastTypes.ERROR,
                        message:
                          "Max Priority fee cannot be greater than max fee",
                      },
                      6000,
                    );
                  } else
                    setGasSettings((prevState) => {
                      return {
                        ...prevState,
                        maxPriorityFee: e.target.value,
                      };
                    });
                }}
                placeholder="0"
                className={`border-2px w-fit border-white bg-transparent text-xl text-accent`}
                label="Max Priority Fee"
              />
            </div>
          )}
        </div>
      }
    </Accordion>
  );
};

export default GasStation;
