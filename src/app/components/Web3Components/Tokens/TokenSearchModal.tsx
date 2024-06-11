import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MetaData, TokenData } from "../../../page";
import Image from "next/image";
import Input from "../../BaseComponents/Input";
import { isAddress } from "viem";
import Modal from "../../BaseComponents/Modal";
import { useAlchemyContext, useChainContext } from "@/app/context/RootContext";
import { addToken } from "@/app/actions/localStorageUtils";
import { Spinner } from "../../BaseComponents";
import { initialize } from "next/dist/server/lib/render-server";

//I had previously factored this into a seperate Modal component but there is no re usage of Modal
const TokenSearchModal = ({
  selectedToken,
  isOpen,
  setIsOpen,
  setToken,
}: {
  selectedToken: TokenData | undefined;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setToken: (token: TokenData) => void;
}) => {
  const [tokens, setTokens] = useState<TokenData[]>();
  const [input, setInput] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customMetaData, setCustomMetaData] = useState<MetaData | undefined>();
  const { address, blockNumber } = useChainContext();

  const { getAllTokenData, initializeStates } = useAlchemyContext();
  const [customTokens, setCustomTokens] = useState<TokenData[]>();

  console.log("SEARCYMODEAL");
  const { getMetaData, fetchStates } = useAlchemyContext();
  const filteredTokens = useMemo(() => {
    if (!tokens) return [] as TokenData[];
    if (input === "") return tokens;
    const filteredData = tokens.filter((token) => {
      return (
        token.metaData.name.toLowerCase().startsWith(input.toLowerCase()) ||
        token.metaData.symbol.toLowerCase().startsWith(input.toLowerCase())
      );
    });
    return filteredData;
  }, [input, tokens]);

  const isValid = useMemo(() => {
    return isAddress(input);
  }, [input]);

  //Reset Search Text
  useEffect(() => {
    setInput("");
  }, [isOpen]);

  useEffect(() => {
    if (isValid) {
      getMetaData(input).then((data) => {
        if (!data) return;
        setCustomMetaData(data as MetaData);
      });
    }
  }, [isValid, getMetaData, input]);

  useEffect(() => {
    if (!address) return;
    //Fetch token balances for all ERC20 tokens in wallet
    getAllTokenData().then((data) => {
      setTokens(data);
    });
  }, [address, getAllTokenData]);

  useEffect(() => {
    if (!blockNumber) return;
    if (!address) return;
    getAllTokenData().then((data) => {
      setTokens(data);
    });
  }, [blockNumber, address, getAllTokenData]);

  const handleImport = async () => {
    addToken(input);

    // const balance = await getBalance(input);
    // setTokens((prevState) => {
    //   if (!metaData) return prevState;
    //   console.log;
    //   if (typeof prevState === "undefined") {
    //     return [
    //       {
    //         metaData: metaData,
    //         address: input,
    //         balance: "0",
    //       },
    //     ];
    //   } else {
    //     return [
    //       ...prevState,
    //       {
    //         metaData: metaData,
    //         address: input,
    //         balance: "0",
    //       },
    //     ];
    //   }
    // });
    // setToken(input);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="text-2xl text-white mt-4">Select a Token</p>
      <div className="flex flex-row">
        <p className="transition ease-in-out w-full mr-4 sm:w-fit origin-left font-bold text-accent ">
          Import custom token
        </p>

        <input
          className="border-4 border-solid accent-amber-600"
          checked={isCustom}
          type="checkbox"
          onChange={(e) => {
            setInput("");
            setIsCustom((prevState) => !prevState);
          }}
        />
      </div>
      {isCustom ? (
        <div className="flex flex-col items-center">
          <Input
            className="placeholder-gray-700 placeholder:italic text-black"
            boxClassName="items-center"
            placeholder="Enter token Address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={(e) => {
              handleImport();
            }}
            className={`flex flex-row bg-background mt-4 p-1 sm:p-2 rounded-full text-xs w-full justify-center max-w-[90px] nohover:text-accent nohover:shadow-accent shadow-white  hover:shadow-accent whitespace-nowrap shadow-fuller text-white hover:text-accent "`}
          >
            {"Import token"}
          </button>
        </div>
      ) : (
        <div className="w-7/12 flex flex-col items-center">
          <Input
            className="placeholder-gray-700 placeholder:italic text-black"
            boxClassName="items-center"
            placeholder="Search token"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {!initializeStates.metaData ? (
            <Spinner />
          ) : (
            <ul className=" flex bg-transparent h-fit max-h-[500px] w-full rounded-2xl justify-center overflow-scroll no-scrollbar">
              <div className="flex flex-col mx-4 border-white border-[1px] rounded-2xl w-full max-w-96">
                {filteredTokens.map((token: TokenData, index: number) => {
                  return (
                    <li
                      className="flex first:rounded-t-2xl flex-row p-2 items-center bg-transparent hover:bg-accent last:rounded-b-2xl"
                      key={index}
                      onClick={() => {
                        setIsOpen(false);
                        setToken(token);
                      }}
                    >
                      <Image
                        className="mx-2 rounded-[100%] shadow-fuller shadow-gray-200"
                        src={token.metaData.logo ?? "https://picsum.photos/200"}
                        alt=""
                        style={{
                          width: "40px",
                          height: "40px",
                        }}
                        width={30}
                        height={30}
                      ></Image>
                      <div className="">
                        <p className="whitespace-nowrap">
                          {token.metaData.name}
                        </p>
                        <div className="flex flex-row text-sm font-600 text-gray-400">
                          Balance:{" "}
                          <p
                            className={`${
                              fetchStates.allBalances
                                ? "animate-pulse-fast"
                                : ""
                            }`}
                          >
                            {token.balance}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </div>
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
};

export default TokenSearchModal;
