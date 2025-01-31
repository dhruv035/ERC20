import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import TokenInput from "./Tokens/TokenInput";
import Input from "../BaseComponents/Input";
import GasStation from "./GasStation";
import { FormData, GasSettings, TokenData } from "@/lib/types";
import { useTransactionContext } from "@/context/RootContext";
import useERC20 from "@/hooks/useERC20";
import Spinner from "../BaseComponents/Spinner";
import Tooltip from "../BaseComponents/Tooltip";
import { FaAddressBook } from "react-icons/fa";
import AddressBookModal from "./AddressBookModal";
import { getStorageDisable, setStorageDisable } from "@/lib/localStorage/pendingState";

const SendTokens = ({
  formData,
  isUpdating,
  setFormData,
}: {
  formData: FormData;
  isUpdating: boolean | undefined;
  setFormData: Dispatch<SetStateAction<FormData>>;
}) => {

  const { pendingState,setPendingState } = useTransactionContext();
  const [gasSettings, setGasSettings] = useState<GasSettings>({
    isDisabled: true,
    maxPriorityFee: "",
    maxFee: "",
  });
  const [localDisable, setLocalDisable] = useState<boolean>(
    typeof window !== "undefined" && getStorageDisable() === "true"
  );
  const { sendTokens } = useERC20();
  const [addressModal,setAddressModal] = useState<boolean>(false);

  //Form Updaters for the Input Field
  const setToken = useCallback((token: TokenData) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        selectedToken: token,
      };
    });
  },[setFormData])

  const setAmount = useCallback((amount: string) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        amount: amount,
      };
    });
  },[setFormData])

  const setReceiverAddress = (address: string) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        toAddress: address,
      };
    });
  }

  const handleSend = async () => {
    if (!formData.selectedToken) return;
    setLocalDisable(true)
    setStorageDisable(true)
    try {
      await sendTokens(
        formData.selectedToken,
        formData.toAddress as `0x${string}`,
        formData.amount,
        gasSettings,
      );
      setFormData({
        selectedToken: undefined,
        amount: "",
        toAddress: "",
      });
    } catch (error) {
    } finally {
      setLocalDisable(false)
      setStorageDisable(false)
    }
  }
  //Side Effects

  const handleLocalDisable = (event: StorageEvent) => {
    if (event.key === "localDisable") {
      setLocalDisable(event.newValue === "true");
    }
  };
  useEffect(() => {
   
    addEventListener("storage", handleLocalDisable);
    return () => {
      removeEventListener("storage", handleLocalDisable);
    };
  }, [handleLocalDisable]);

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
              <div className="flex flex-row justify-between">
              <p
                className={`origin-left font-bold text-accent transition ease-in-out group-focus-within:scale-[0.75] ${
                  formData.selectedToken ? "" : "text-gray-400"
                }`}
              >
                Receiver
              </p>
              <FaAddressBook className="text-accent mr-2 cursor-pointer self-center" onClick={()=>setAddressModal(true)} />
              </div>
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
          <GasStation gasSettings={gasSettings} setGasSettings={setGasSettings}/>
          <button
            disabled={
              localDisable ||
              pendingState?.isTxDisabled ||
              !formData.selectedToken
            }
            onClick={handleSend}
            className="group/tooltip mt-2 self-center rounded-full"
          >
            <div className="flex min-w-[100px] justify-center rounded-full bg-background p-2 text-text shadow-fuller shadow-shadow hover:text-accent hover:shadow-accent nohover:text-accent nohover:shadow-accent">
              {pendingState?.isTxDisabled || localDisable ? (
                <Spinner />
              ) : (
                "Send Token"
              )}
            </div>
            {
              <Tooltip
                isHidden={
                  localDisable ||
                  pendingState?.isTxDisabled ||
                  !formData.selectedToken
                }
                text={
                  localDisable
                    ? "Sending Transaction"
                    : pendingState?.isTxDisabled
                      ? "Network busy"
                      : "Select a token first"
                }
              />
            }
          </button>
        </div>
        
      }
      {
        addressModal && <AddressBookModal isOpen={addressModal} setIsOpen={setAddressModal} setAddress={setReceiverAddress} />
      }
    </div>
  );
};
export default SendTokens;
