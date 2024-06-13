"use client";
import { useCallback, useEffect, useState } from "react";
import Blockchain from "./components/Web3Components/Blockchain";
import PendingTransaction from "./components/Web3Components/PendingTransaction";
import SendTokens from "./components/Web3Components/SendTokens";
import Tooltip from "./components/BaseComponents/Tooltip";
import { AnimatePresence, m } from "framer-motion";
import { useAccount, useBlockNumber } from "wagmi";
import useAlchemyHooks from "./actions/useAlchemyHooks";

export type TokenData = {
  balance: string;
  address: string;
  metaData: MetaData;
};

export type MetaData = {
  decimals: number;
  logo: string | null;
  name: string;
  symbol: string;
};

export type FormData = {
  selectedToken: TokenData | undefined;
  toAddress: string;
  amount: string;
};

const Home = () => {
  const [isSendTab, setIsSendTab] = useState<boolean>(false);
  const { getTokenData, fetchStates } = useAlchemyHooks();

  const { address, chain } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const [formData, setFormData] = useState<FormData>({
    selectedToken: undefined,
    toAddress: "",
    amount: "",
  });
  const setForm = (newStates: Partial<FormData>) => {
    setFormData((prevState) => ({ ...prevState, ...newStates }));
  };

  useEffect(() => {
    if (!address) {
      setIsSendTab(false);
      return;
    }
  }, [address]);

  useEffect(() => {
    setForm({ amount: "" });
  }, [formData.selectedToken?.address]);

  useEffect(() => {
    setForm({ amount: "", selectedToken: undefined });
  }, [address, chain]);


  const updateTokenData = useCallback(()=>{
    getTokenData(formData.selectedToken?.address).then((data) => {
      setFormData((prevState) => ({ ...prevState, selectedToken: data }));
    });
  },[getTokenData,formData.selectedToken?.address])
  useEffect(() => {
    if (!blockNumber) return;
    updateTokenData();
  }, [blockNumber, updateTokenData]);
  return (
    <div className="flex min-h-[92vh] w-full flex-col items-center px-8 md:min-h-[90vh]">
      <AnimatePresence>
        <m.div
          key="pendingTx"
          initial={{ opacity: 0, translateY: -100 }}
          animate={{ opacity: 1, translateY: 0, transition: { duration: 1 } }}
          exit={{ opacity: 0, translateY: -100, transition: { duration: 1 } }}
        >
          <PendingTransaction />
        </m.div>
      </AnimatePresence>
      <div className="my-4 min-h-96 w-full max-w-[400px] overflow-hidden rounded-[10px] bg-[rgba(255,255,255,0.04)] p-2 text-accent shadow-fuller shadow-accent">
        <div className="grid grid-cols-2 text-center text-text">
          <button
            onClick={() => {
              setIsSendTab(true);
            }}
            disabled={typeof address === "undefined"}
            className={`group/tooltip text-nowrap rounded-t-xl border-[1.5px] border-b-0 border-accent bg-transparent p-2 ${
              !isSendTab
                ? "z-[1] text-accent shadow-fuller shadow-accent"
                : "text-text"
            } `}
          >
            Send Tokens
            {
              <Tooltip
                isHidden={typeof address === "undefined"}
                text="Connect Wallet"
              />
            }
          </button>
          <button
            onClick={() => {
              setIsSendTab(false);
            }}
            className={`-ml-[1px] text-nowrap rounded-t-xl border-[1.5px] border-b-0 border-accent bg-transparent p-2 pb-0 ${
              isSendTab
                ? "z-[1] text-accent shadow-fuller shadow-accent"
                : "text-text"
            }`}
          >
            Chain Data
          </button>
        </div>
        <AnimatePresence mode={"wait"}>
          {isSendTab ? (
            <m.div
              key="sendTokens"
              initial={{ opacity: 0, translateX: -100 }}
              animate={{
                opacity: 1,
                translateX: 0,
                transition: { duration: 0.1 },
              }}
              exit={{
                opacity: 0,
                translateX: -100,
                transition: { duration: 0.1 },
              }}
            >
              <SendTokens
                formData={formData}
                setFormData={setFormData}
                isUpdating={fetchStates.tokenData}
              />
            </m.div>
          ) : (
            <m.div
              key="chainData"
              initial={{ opacity: 0, translateX: 100 }}
              animate={{
                opacity: 1,
                translateX: 0,
                transition: { duration: 0.1 },
              }}
              exit={{
                opacity: 0,
                translateX: 100,
                transition: { duration: 0.1 },
              }}
            >
              <Blockchain />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
