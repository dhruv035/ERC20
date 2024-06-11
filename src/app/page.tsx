"use client";
import { useEffect, useState } from "react";
import Blockchain from "./components/Web3Components/Blockchain";
import PendingTransaction from "./components/Web3Components/PendingTransaction";
import SendTokens from "./components/Web3Components/SendTokens";
import { useAlchemyContext, useChainContext } from "./context/RootContext";
import Tooltip from "./components/BaseComponents/Tooltip";
import { AnimatePresence, m } from "framer-motion";
import { useAccount } from "wagmi";

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
  const { address, blockNumber } = useChainContext();
  const { getTokenData } = useAlchemyContext();

  const [formData, setFormData] = useState<FormData>({
    selectedToken: undefined,
    toAddress: "",
    amount: "",
  });
  
  useEffect(() => {
    if (!address) {
      setIsSendTab(false);
      return;
    }
  }, [address]);


  useEffect(() => {
    setFormData((prevState) => ({ ...prevState, amount: "" }));
  }, [formData.selectedToken?.address]);

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      amount: "",
      selectedToken: undefined,
    }));
  }, [address]);

  useEffect(() => {
    if (!formData.selectedToken?.address) return;
    if (!blockNumber) return;
    getTokenData(formData.selectedToken.address).then((data) => {
      setFormData((prevState) => ({ ...prevState, selectedToken: data }));
    });
  }, [formData.selectedToken?.address,blockNumber, getTokenData]);

  return (
    <div className="flex flex-col w-full min-h-[92vh] md:min-h-[90vh] items-center px-8 mt-4">
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
      <div className=" shadow-fuller shadow-accent bg-[rgba(255,255,255,0.04)] min-h-96 w-full max-w-[400px] text-accent rounded-[10px] p-2 my-4 overflow-hidden">
        <div className="grid grid-cols-2 text-text text-center">
          <button
            onClick={() => {
              setIsSendTab(true);
            }}
            disabled={typeof address === "undefined"}
            className={`group/tooltip p-2 text-nowrap rounded-t-xl border-accent border-[1.5px] bg-transparent border-b-0  ${
              !isSendTab
                ? "z-[1] shadow-fuller shadow-accent text-accent "
                : "text-text"
            }  `}
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
            className={`p-2 pb-0 text-nowrap rounded-t-xl border-[1.5px] bg-transparent border-accent border-b-0 -ml-[1px]  ${
              isSendTab
                ? "z-[1] shadow-fuller shadow-accent text-accent "
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
              <SendTokens formData={formData} setFormData={setFormData}/>
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
