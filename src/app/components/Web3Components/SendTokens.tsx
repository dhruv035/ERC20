import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import TokenInput from "./Tokens/TokenInput";
import Input from "../BaseComponents/Input";
import GasStation from "./GasStation";
import { FormData, TokenData } from "../../page";
import { useTransactionContext } from "@/app/context/RootContext";
import useERC20 from "@/app/actions/erc20Hooks";
import Spinner from "../BaseComponents/Spinner";
import Tooltip from "../BaseComponents/Tooltip";

const SendTokens = ({
  formData,
  isUpdating,
  setFormData,
}: {
  formData: FormData;
  isUpdating: boolean | undefined;
  setFormData: Dispatch<SetStateAction<FormData>>;
}) => {
  const [localDisable, setLocalDisable] = useState<boolean>(
    (typeof window !== "undefined" &&
      localStorage.getItem("localDisable") === "true") ??
      false,
  );
  const { pendingState } = useTransactionContext();
  const { sendTokens } = useERC20();

  console.log("DISABLESTATES",pendingState.isTxDisabled,localDisable)
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
        formData.amount,
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
      <p className="my-4 text-center text-2xl text-accent">
        Send ERC-20 Tokens
      </p>
      {
        <div className="flex flex-col px-2 md:px-4">
          <TokenInput
            isUpdating={isUpdating}
            amount={formData.amount}
            setAmount={setAmount}
            selectedToken={formData.selectedToken}
            setToken={setToken}
          />
          <div
            className={`my-4 rounded-2xl bg-accent p-[1px] text-accent ${
              formData.selectedToken ? "" : "bg-gray-400"
            }`}
          >
            <div className="group flex flex-col rounded-2xl bg-background p-2">
              <p
                className={`origin-left font-bold text-accent transition ease-in-out group-focus-within:scale-[0.75] ${
                  formData.selectedToken ? "" : "text-gray-400"
                }`}
              >
                Receiver
              </p>
              <Input
                placeholder="Enter Receiver's Address"
                value={formData.toAddress}
                disabled={formData.selectedToken ? false : true}
                className={`border-2px w-fit border-white bg-transparent text-xl text-accent`}
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
            className="group/tooltip mt-2 self-center rounded-full"
          >
            <div className="flex min-w-[100px] justify-center rounded-full bg-background p-2 text-text shadow-fuller shadow-shadow hover:text-accent hover:shadow-accent nohover:text-accent nohover:shadow-accent">
              {pendingState.isTxDisabled || localDisable ? (
                <Spinner />
              ) : (
                "Send Token"
              )}
            </div>
            {
              <Tooltip
                isHidden={
                  localDisable ||
                  pendingState.isTxDisabled ||
                  !formData.selectedToken
                }
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
