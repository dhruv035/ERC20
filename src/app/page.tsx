"use client";
import { useEffect, useMemo, useState } from "react";
import Blockchain from "./components/Web3Components/Blockchain";
import PendingTransaction from "./components/Web3Components/PendingTransaction";
import SendTokens from "./components/Web3Components/SendTokens";
import { useAlchemyContext, useChainContext } from "./context/RootContext";

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
  const {blockNumber} = useChainContext();
  const [tokens, setTokens] = useState<TokenData[]>();
  const [customToken,setCustomToken] = useState<TokenData>();
  const [formData, setFormData] = useState<FormData>({
    selectedToken: undefined,
    toAddress: "",
    amount: "",
  });
    const { address, chain } = useChainContext();
  
  const { getAllBalances } = useAlchemyContext();

  useEffect(() => {
    console.log("UPDATE")
    setFormData((prevState) => ({ ...prevState, amount: "" }));
  }, [formData.selectedToken?.address]);

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


  useEffect(()=>{
    setFormData((prevState) => ({ ...prevState, amount:"", selectedToken: undefined }));
    
  },[address])

  useEffect(()=>{
    console.log("TRIGGERED")
    if(formData.selectedToken?.address)
      {
        const find = tokens?.find(token=>token.address===formData.selectedToken?.address)
        setFormData(prevState=>({...prevState,selectedToken:find}))
      }
  },[formData.selectedToken?.address, tokens])
  useEffect(()=>{
    if(!blockNumber)
      return;
    if(!address)
      return
    getAllBalances().then((data) => {

      setTokens(data);
    });
  },[blockNumber,address])

  return (
    <div className="flex flex-col w-full min-h-[92vh] md:min-h-[90vh] items-center px-8 mt-4">
      <PendingTransaction />
      <div className=" shadow-fuller shadow-accent bg-[rgba(255,255,255,0.04)] min-h-96 w-full max-w-[400px] text-accent rounded-[10px] p-2 my-4">
        <div className="grid grid-cols-2 text-text text-center">
          <button
            onClick={() => {
              setIsSendTab(true);
            }}
            disabled={typeof address === "undefined"}
            className={`group/tab p-[1.5px] pb-0 text-nowrap rounded-t-xl bg-accent  ${
              !isSendTab
                ? "z-[1] shadow-fuller shadow-accent text-accent "
                : "text-text"
            }  `}
          >
            {<div className="bg-background rounded-t-xl p-2">Send Tokens</div>}
            {
              //Tooltip
              <div
                className={`absolute hidden group-hover/tab:group-disabled/tab:flex p-4 z-[1] -translate-y-28 ${
                  typeof address === "undefined" ? "hidden" : ""
                }`}
              >
                <div className="relative w-full rounded-2xl text-text-base flex bg-accent p-2 md:p-4">
                  {"Connect Wallet"}
                </div>
              </div>
            }
          </button>
          <button
            onClick={() => {
              setIsSendTab(false);
            }}
            className={`p-[1.5px] pb-0 text-nowrap rounded-t-xl bg-accent  ${
              isSendTab
                ? "z-[1] shadow-fuller shadow-accent text-accent "
                : "text-text"
            }`}
          >
            <div className="bg-background rounded-t-xl p-2">Chain Data</div>
          </button>
        </div>
        {isSendTab ? <SendTokens formData={formData} setFormData={setFormData} tokens={tokens} setTokens={setTokens} /> : <Blockchain />}
      </div>
    </div>
  );
};

export default Home;
