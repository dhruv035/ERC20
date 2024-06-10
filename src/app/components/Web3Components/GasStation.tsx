import { useState } from "react";
import Input from "../BaseComponents/Input";
import Accordion from "../BaseComponents/Accordion";
import { useToast, useChainContext } from "@/app/context/RootContext";
import { ToastTypes } from "../BaseComponents/Toast";

const GasStation = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { gasSettings, setGasSettings, gasEstimate } = useChainContext();
  const { open: openToast } = useToast();
  return (
   
    <Accordion isOpen={isOpen} setIsOpen={setIsOpen} header="Gas Station">
      {
        <div
        className={`group flex flex-col transition-all justify-center overflow-hidden ${
          isOpen
            ? gasSettings.isDisabled
              ? "h-[40px]"
              : "h-[300px]"
            : " h-[0px]"
        }`}
      >
        <div className={` flex flex-row items-center`}>
          <p className="transition ease-in-out w-full mr-4 sm:w-fit origin-left font-bold text-accent ">
            Use Metamask to set Gas Price
          </p>

          <input
            className="border-4 border-solid accent-amber-600 min-w-12"
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
            <div className="flex flex-col w-full items-center">
              <p className="text-xl text-accent">Suggested Fee</p>
              <table className="w-full items-start">
                <thead>
                  <tr className="text-accent">
                    <th>Max Fee</th>
                    <th>Max Priority Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td
                      className="hover:text-accent hover:underline hover:cursor-pointer"
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
                      className="hover:text-accent hover:underline hover:cursor-pointer"
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
              className={`text-xl text-accent border-2px border-white w-fit bg-transparent `}
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
                    6000
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
              className={`text-xl text-accent border-2px border-white w-fit bg-transparent `}
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
