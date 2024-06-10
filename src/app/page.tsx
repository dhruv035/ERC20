"use client";
import { useEffect, useMemo, useState } from "react";
import Blockchain from "./components/Web3Components/Blockchain";
import PendingTransaction from "./components/Web3Components/PendingTransaction";
import SendTokens from "./components/Web3Components/SendTokens";
import { useAlchemyContext, useChainContext } from "./context/RootContext";
import Tooltip from "./components/BaseComponents/Tooltip";
import { AnimatePresence, m, domAnimation, LazyMotion } from "framer-motion";

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
  const { blockNumber } = useChainContext();
  const [tokens, setTokens] = useState<TokenData[]>();
  const [customToken, setCustomToken] = useState<TokenData>();
  const [formData, setFormData] = useState<FormData>({
    selectedToken: undefined,
    toAddress: "",
    amount: "",
  });
  const { address, chain } = useChainContext();

  const { getAllBalances } = useAlchemyContext();

  useEffect(() => {
    if (!address) {
      setIsSendTab(false);
      return;
    }
    //Fetch token balances for all ERC20 tokens in wallet
    getAllBalances().then((data) => {
      setTokens(data);
    });
  }, [address, getAllBalances]);

  useEffect(() => {
    if (!blockNumber) return;
    if (!address) return;
    getAllBalances().then((data) => {
      setTokens(data);
    });
  }, [blockNumber, address]);

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
              key="asd"
              initial={{ opacity: 0, translateY: 100 }}
              animate={{
                opacity: 1,
                translateY: 0,
                transition: { duration: 0.2 },
              }}
              exit={{
                opacity: 0,
                translateY: 100,
                transition: { duration: 0.2 },
              }}
            >
              <SendTokens tokens={tokens} setTokens={setTokens} />
            </m.div>
          ) : (
            <m.div
              key="123"
              initial={{ opacity: 0, translateY: 100 }}
              animate={{
                opacity: 1,
                translateY: 0,
                transition: { duration: 0.2 },
              }}
              exit={{
                opacity: 0,
                translateY: 100,
                transition: { duration: 0.2 },
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
