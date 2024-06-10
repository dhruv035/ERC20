import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import TokenInput from "./Tokens/TokenInput";
import Input from "../BaseComponents/Input";
import GasStation from "./GasStation";
import { FormData, TokenData } from "../../page";
import { useTransactionContext } from "@/app/context/RootContext";
import useERC20 from "@/app/actions/erc20Hooks";
import Spinner from "../BaseComponents/Spinner";

const SendTokens = ({
  tokens,
  formData,
  setFormData,
  setTokens,
}: {
  tokens: TokenData[] | undefined;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  setTokens: Dispatch<SetStateAction<TokenData[] | undefined>>;
}) => {
  const [localDisable, setLocalDisable] = useState<boolean>(false);
  const { pendingState } = useTransactionContext();
  const { sendTokens } = useERC20();

  const tokensRef = useRef<TokenData[]>();
  tokensRef.current = tokens;

  const setToken = async (address: string) => {
    if (!tokensRef.current) return;
    const data = tokensRef.current.find((token) => token.address === address);
    setFormData((prevState) => {
      return {
        ...prevState,
        selectedToken: data,
      };
    });
  };

  return (
    <div>
      <p className="my-4 text-2xl text-accent text-center">
        Send ERC-20 Tokens
      </p>
      {
        <div className="flex flex-col px-2 md:px-4">
          <TokenInput
            setTokens={setTokens}
            amount={formData.amount}
            setAmount={(amount) => {
              setFormData((prevState) => {
                return {
                  ...prevState,
                  amount: amount,
                };
              });
            }}
            tokens={tokens ?? []}
            selectedToken={formData.selectedToken}
            setToken={setToken}
          />
          <div
            className={`my-4 p-[1px] text-accent bg-accent rounded-2xl ${
              formData.selectedToken ? "" : "bg-gray-400"
            }`}
          >
            <div className="group flex rounded-2xl flex-col p-2 bg-background">
              <p
                className={`transition ease-in-out origin-left font-bold text-accent group-focus-within:scale-[0.75] ${
                  formData.selectedToken ? "" : "text-gray-400"
                }`}
              >
                Receiver
              </p>
              <Input
                placeholder="Enter Receiver's Address"
                value={formData.toAddress}
                disabled={formData.selectedToken ? false : true}
                className={`text-xl text-accent border-2px border-white w-fit bg-transparent `}
                onChange={(e) => {
                  setFormData((prevState) => {
                    return {
                      ...prevState,
                      toAddress: e.target.value,
                    };
                  });
                }}
              />
            </div>
          </div>
          <GasStation />
          <button
            disabled={
              localDisable ||
              pendingState.isTxDisabled ||
              !formData.selectedToken
            }
            onClick={async () => {
              if (!formData.selectedToken) return;
              setLocalDisable(true);
              try {
                await sendTokens(
                  formData.selectedToken,
                  formData.toAddress as `0x${string}`,
                  formData.amount
                );
                setFormData({
                  selectedToken: undefined,
                  amount: "",
                  toAddress: "",
                });
              } catch (error) {
              } finally {
                setLocalDisable(false);
              }
            }}
            className="group rounded-full mt-2 self-center  "
          >
            <div className="bg-background flex justify-center shadow-fuller text-text shadow-shadow nohover:shadow-accent nohover:text-accent hover:shadow-accent  hover:text-accent min-w-[100px] rounded-full p-2">
              {(pendingState.isTxDisabled || localDisable) ? (
                <Spinner />
              ) : (
                "Send Token"
              )}
            </div>
            {
              //Tooltip
              <div
                className={`absolute hidden group-hover:group-disabled:flex p-4 z-[1] -translate-y-28 ${
                  (pendingState.isTxDisabled || localDisable) ? "hidden" : ""
                }`}
              >
                <div className="relative w-full rounded-2xl text-text-base flex bg-accent p-2 md:p-4">
                  {localDisable
                    ? "Sending Transaction"
                    : pendingState.isTxDisabled
                    ? "Network busy"
                    : "Select a token first"}
                </div>
              </div>
            }
          </button>
        </div>
      }
    </div>
  );
};
export default SendTokens;
