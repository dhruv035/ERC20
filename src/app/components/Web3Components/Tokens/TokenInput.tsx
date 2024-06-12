import { useRef, useState } from "react";
import Image from "next/image";
import { TokenData } from "../../../page";
import Input from "../../BaseComponents/Input";
import TokenSearchModal from "./TokenSearchModal";
import { useToast } from "@/app/context/RootContext";
import { ToastTypes } from "../../BaseComponents/Toast";
import { countDecimals } from "@/app/actions/utils";
import useAlchemyHooks from "@/app/actions/useAlchemyHooks";

const TokenInput = ({
  amount,
  selectedToken,
  isUpdating,
  setToken,
  setAmount,
}: {
  amount: string;
  selectedToken?: TokenData;
  isUpdating: boolean | undefined;
  setToken: (token: TokenData) => void;
  setAmount: (amount: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { open: openToast } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative flex flex-col overflow-hidden text-text">
      {
        <div
          className={`rounded-2xl bg-accent p-[1px] ${
            selectedToken ? "" : "bg-gray-400"
          }`}
        >
          <div
            className={`flex flex-col overflow-hidden rounded-2xl bg-background p-2`}
          >
            <div className="flex flex-row overflow-hidden">
              <div className="group w-[70%]">
                <p
                  className={`${
                    selectedToken ? "" : "text-gray-400"
                  } origin-left font-bold text-accent transition ease-in-out group-focus-within:scale-[1.25]`}
                >
                  Amount
                </p>
                <Input
                  placeholder="0"
                  type="number"
                  className={`border-2px w-fit border-white bg-transparent text-2xl text-accent`}
                  disabled={selectedToken ? false : true}
                  value={amount}
                  onChange={(e) => {
                    if (!selectedToken) return;

                    const decimals = countDecimals(e.target.value);
                    console.log(
                      "decimals",
                      decimals,
                      selectedToken.metaData.decimals,
                    );
                    if (Number(e.target.value) < 0) {
                      openToast(
                        {
                          title: "Amount Too low",
                          type: ToastTypes.ERROR,
                          message: `Cannot set amount to negative`,
                        },
                        6000,
                      );
                      setAmount("0");
                    } else if (selectedToken.metaData.decimals < decimals) {
                      openToast(
                        {
                          title: "Decimal point exceeded",
                          type: ToastTypes.ERROR,
                          message: `Token supports only ${selectedToken.metaData.decimals} decimals`,
                        },
                        6000,
                      );
                      return;
                    } else if (
                      selectedToken?.balance &&
                      Number(e.target.value) > Number(selectedToken?.balance)
                    ) {
                      openToast(
                        {
                          title: "Amount Too high",
                          type: ToastTypes.ERROR,
                          message: `Amount exceeded balance, amount set to max balance`,
                        },
                        6000,
                      );
                      setAmount(selectedToken.balance);
                    } else setAmount(e.target.value);
                  }}
                />
              </div>
              <div className="my-1 flex w-[30%] flex-col items-end">
                <button
                  onClick={() => {
                    setIsOpen((prevState) => !prevState);
                  }}
                  className={`mr-1 flex w-full max-w-[90px] flex-row items-center whitespace-nowrap rounded-full border-[1px] border-background bg-background p-1 text-xs shadow-fuller hover:border-accent hover:text-accent hover:shadow-accent sm:mr-4 sm:p-2 nohover:text-accent nohover:shadow-accent ${
                    selectedToken
                      ? "underline shadow-accent"
                      : "italic shadow-shadow"
                  }`}
                >
                  {selectedToken && (
                    <Image
                      className="mr-[4px] rounded-[100%]"
                      src={
                        selectedToken.metaData.logo ??
                        "https://picsum.photos/200"
                      }
                      alt=""
                      style={{
                        width: "20px",
                        height: "20px",
                      }}
                      width={20}
                      height={20}
                    ></Image>
                  )}
                  <p className="overflow-hidden">
                    {(selectedToken?.metaData?.symbol?.length &&
                    selectedToken?.metaData.symbol.length > 6
                      ? selectedToken?.metaData.symbol.substring(0, 5) + ".."
                      : selectedToken?.metaData.symbol) ?? "Select Token"}
                  </p>
                </button>
              </div>
            </div>
            <div className="flex w-full flex-row-reverse items-baseline whitespace-nowrap">
              <div
                className={`flex flex-row text-sm ${
                  isUpdating ? "animate-pulse-fast text-red-600" : "text-accent"
                } `}
              >
                <p>Balance:</p> <div>{selectedToken?.balance}</div>
              </div>
              <button
                disabled={selectedToken ? false : true}
                onClick={(e) => {
                  setAmount(selectedToken?.balance ?? amount);
                }}
                className="mr-2 text-text underline hover:text-accent"
              >
                Max
              </button>
            </div>
          </div>
        </div>
      }
      {isOpen && (
        <TokenSearchModal
          selectedToken={selectedToken}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setToken={setToken}
        />
      )}
    </div>
  );
};

export default TokenInput;
