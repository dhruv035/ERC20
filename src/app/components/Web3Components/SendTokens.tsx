import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import TokenInput from "./Tokens/TokenInput";
import Input from "../BaseComponents/Input";
import GasStation from "./GasStation";
import { FormData, TokenData } from "../../page";
import {
  useAlchemyContext,
  useChainContext,
  useTransactionContext,
} from "@/app/context/RootContext";
import useERC20 from "@/app/actions/erc20Hooks";
import Spinner from "../BaseComponents/Spinner";
import Tooltip from "../BaseComponents/Tooltip";



const SendTokens = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
}) => {
  const [localDisable, setLocalDisable] = useState<boolean>(false);
  const { pendingState } = useTransactionContext();
  const { sendTokens } = useERC20();

  //Form Updaters for the Input Field
  const setToken = (token: TokenData) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        selectedToken: token,
      };
    });
  };

  const setAmount = (amount: string) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        amount: amount,
      };
    });
  };

  const handleSend = async () => {
    if (!formData.selectedToken) return;
    setLocalDisable(true);
    localStorage.setItem("localDisable", "true");
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
      localStorage.setItem("localDisable", "false");
    }
  };
  //Side Effects

  useEffect(() => {
    const handleLocalDisable = (event: StorageEvent) => {
      if (event.key === "localDisable") {
        setLocalDisable(event.newValue === "true");
      }
    };

    addEventListener("storage", handleLocalDisable);
    return () => {
      removeEventListener("storage", handleLocalDisable);
    };
  }, []);

  return (
    <div>
      <p className="my-4 text-2xl text-accent text-center">
        Send ERC-20 Tokens
      </p>
      {
        <div className="flex flex-col px-2 md:px-4">
          <TokenInput
            amount={formData.amount}
            setAmount={setAmount}
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
            onClick={handleSend}
            className="group/tooltip rounded-full mt-2 self-center  "
          >
            <div className="bg-background flex justify-center shadow-fuller text-text shadow-shadow nohover:shadow-accent nohover:text-accent hover:shadow-accent  hover:text-accent min-w-[100px] rounded-full p-2">
              {pendingState.isTxDisabled || localDisable ? (
                <Spinner />
              ) : (
                "Send Token"
              )}
            </div>
            {
              <Tooltip
                isHidden={pendingState.isTxDisabled || localDisable}
                text={
                  localDisable
                    ? "Sending Transaction"
                    : pendingState.isTxDisabled
                    ? "Network busy"
                    : "Select a token first"
                }
              />
            }
          </button>
        </div>
      }
    </div>
  );
};
export default SendTokens;
