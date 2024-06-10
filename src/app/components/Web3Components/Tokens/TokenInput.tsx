import {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { TokenData } from "../../../page";
import Input from "../../BaseComponents/Input";
import TokenSearchModal from "./TokenSearchModal";
import { useToast } from "@/app/context/RootContext";
import { ToastTypes } from "../../BaseComponents/Toast";

const TokenInput = ({
  tokens,
  amount,
  selectedToken,
  setToken,
  setAmount,
  setTokens,
}: {
  tokens: TokenData[];
  amount: string;
  selectedToken?: TokenData;
  setToken: (address: string) => void;
  setAmount: (amount: string) => void;
  setTokens:Dispatch<SetStateAction<TokenData[]|undefined>>;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { open: openToast } = useToast();

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative overflow-hidden flex flex-col text-text">
      {
        <div
          className={`p-[1px] bg-accent rounded-2xl ${
            selectedToken ? "" : "bg-gray-400"
          }`}
        >
          <div className={`flex flex-col overflow-hidden rounded-2xl p-2 bg-background `}>
            <div className="flex overflow-hidden flex-row">
              <div className="group w-[70%]">
                <p
                  className={`${
                    selectedToken ? "" : "text-gray-400"
                  } transition ease-in-out origin-left font-bold text-accent group-focus-within:scale-[1.25] `}
                >
                  Amount
                </p>
                <Input
                  placeholder="0"
                  type="number"
                  className={`text-4xl text-accent border-2px border-white w-fit bg-transparent `}
                  disabled={selectedToken ? false : true}
                  value={amount}
                  onChange={(e) => {
                    if(Number(e.target.value)<0)
                      {
                        openToast(
                          {
                            title: "Amount Too low",
                            type: ToastTypes.ERROR,
                            message: `Cannot set amount to negative`,
                          },
                          6000
                        );
                        setAmount("0");
                      }
                    else if (
                      selectedToken?.balance &&
                      Number(e.target.value) > Number(selectedToken?.balance)
                    ) {
                      openToast(
                        {
                          title: "Amount Too high",
                          type: ToastTypes.ERROR,
                          message: `Amount exceeded balance, amount set to max balance`,
                        },
                        6000
                      );
                      setAmount(selectedToken.balance);
                    } else setAmount(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-col w-[30%] items-end my-1">
                <div className="flex p-[1px] rounded-full hover:bg-accent mr-1 sm:mr-4">
                  <button
                    onClick={() => {
                      setIsOpen((prevState) => !prevState);
                    }}
                    className={`flex flex-row bg-background p-1 sm:p-2 rounded-full text-xs w-full 
                    items-center max-w-[90px] nohover:text-accent nohover:shadow-accent whitespace-nowrap shadow-fuller 
                    hover:shadow-accent  hover:text-accent ${
                      selectedToken
                        ? " underline shadow-accent"
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
                      {(selectedToken?.metaData.symbol.length &&
                      selectedToken?.metaData.symbol.length > 6
                        ? selectedToken?.metaData.symbol.substring(0, 5) + ".."
                        : selectedToken?.metaData.symbol) ?? "Select Token"}
                    </p>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-row-reverse whitespace-nowrap items-baseline">
              <p className="text-xs text-gray-500 ">
                Balance: {selectedToken?.balance}
              </p>
              <button
                disabled={selectedToken ? false : true}
                onClick={(e) => {
                  setAmount(selectedToken?.balance ?? amount);
                }}
                className="mr-2 underline text-text hover:text-accent"
              >
                Max
              </button>
            </div>
          </div>
        </div>
      }
      <TokenSearchModal
        selectedToken={selectedToken}
        tokens={tokens}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setToken={setToken}
        setTokens={setTokens}
      />
    </div>
  );
};

export default TokenInput;
