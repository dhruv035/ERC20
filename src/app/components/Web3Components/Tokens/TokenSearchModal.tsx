import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MetaData, TokenData } from "../../../page";
import Image from "next/image";
import Input from "../../BaseComponents/Input";
import { isAddress } from "viem";
import Modal from "../../BaseComponents/Modal";
import { useChainContext } from "@/app/context/RootContext";
import { addToken } from "@/app/actions/localStorageUtils";
import { Spinner } from "../../BaseComponents";
import useAlchemyHooks from "@/app/actions/useAlchemyHooks";
import { shortenHash } from "@/app/actions/utils";
import { LuCopy } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";
import Tooltip from "../../BaseComponents/Tooltip";

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
  const [customToken, setCustomToken] = useState<TokenData | undefined>();
  const { address, blockNumber } = useChainContext();
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  const { getAllTokenData, initializeStates, getTokenData, fetchStates } =
    useAlchemyHooks();
  const [importedTokens, setImportedTokens] = useState<TokenData[]>();

  console.log("FETCHSTATES", fetchStates);
  const filteredTokens = useMemo(() => {
    if (!tokens) return [] as TokenData[];
    if (input === "") return tokens;
    const filteredData = tokens.filter((token) => {
      return (
        token.metaData.name?.toLowerCase().startsWith(input.toLowerCase()) ||
        token.metaData.symbol?.toLowerCase().startsWith(input.toLowerCase())
      );
    });
    return filteredData;
  }, [input, tokens]);

  //Reset Search Text
  useEffect(() => {
    setInput("");
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokensBookString = localStorage.getItem("tokensBook");
      if (!tokensBookString) return;
      const tokensBookArray = JSON.parse(tokensBookString);
      console.log("123:ARRAY", tokensBookArray);
      setImportedTokens(tokensBookArray);
    }
  }, []);
  console.log("123:IMPORTED", importedTokens);

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

  const handleImport = useCallback(async () => {
    if (!customToken) return;
    addToken(input);
    setImportedTokens((prevState) => {
      const data = prevState ? [...prevState] : [];
      return [...data, customToken];
    });
  }, [input, customToken]);

  const isValid = useMemo<boolean>(() => {
    return isAddress(input);
  }, [input]);
  useEffect(() => {
    if (!isValid) {
      setCustomToken(undefined);
      return;
    }
    getTokenData(input).then((tokenData) => {
      setCustomToken(tokenData);
    });
  }, [isValid]);

  const handleStorageUpdate = useCallback((event: StorageEvent) => {
    if (event.key === "tokensBook") {
      if (!event.newValue) {
        setImportedTokens([]);
        return;
      }
      const importedTokens = JSON.parse(event.newValue);
      setImportedTokens(importedTokens);
    }
  }, []);
  useEffect(() => {
    addEventListener("storage", handleStorageUpdate);
    return () => {
      removeEventListener("storage", handleStorageUpdate);
    };
  }, [handleStorageUpdate]);
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
            disabled={!isValid}
            onClick={(e) => {
              handleImport();
            }}
            className={`border-[1px] border-background hover:border-accent mr-1 sm:mr-4 flex flex-row bg-background p-1 sm:p-2 rounded-full text-xs w-full 
                    items-center max-w-[90px] nohover:text-accent nohover:shadow-accent whitespace-nowrap shadow-fuller mb-4 
                    hover:shadow-accent  hover:text-accent ${
                      selectedToken ? " shadow-accent" : "italic shadow-shadow"
                    }`}
          >
            {"Import token"}
          </button>
          {fetchStates.tokenData && <Spinner />}

          {
            //Show metaData here
            customToken && (
              <div className="flex flex-col items-center">
                {"Logo"}
                <Image
                  className="mx-2 rounded-[100%] shadow-fuller shadow-gray-200"
                  src={
                    customToken.metaData?.logo ?? "https://picsum.photos/200"
                  }
                  alt=""
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                  width={30}
                  height={30}
                ></Image>
                <p>Name: {customToken.metaData?.name}</p>
                <p>Symbol: {customToken.metaData?.symbol}</p>
                <p>Decimals: {customToken.metaData?.decimals}</p>
                <p>Balance: {customToken.balance}</p>
              </div>
            )
          }
        </div>
      ) : (
        <div className="w-7/12 flex flex-col items-center ">
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
            <ul className=" flex bg-transparent h-fit max-h-[200px] w-full rounded-2xl justify-center overflow-scroll no-scrollbar border-white border-[1px]">
              <div className="flex flex-col rounded-2xl w-full max-w-96">
                {importedTokens &&
                  importedTokens.map((token: TokenData, index: number) => {
                    return (
                      <li
                        className="flex first:rounded-t-2xl flex-row p-2 items-center bg-transparent hover:bg-background hover:cursor-pointer last:rounded-b-2xl"
                        key={index}
                        onClick={(e) => {
                          setIsOpen(false);
                          setToken(token);
                        }}
                      >
                        <Image
                          className="mx-2 rounded-[100%] shadow-fuller shadow-gray-200"
                          src={
                            token.metaData?.logo ?? "https://picsum.photos/200"
                          }
                          alt=""
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                          width={30}
                          height={30}
                        ></Image>
                        <div className="flex flex-col w-full">
                          <p className="whitespace-nowrap">
                            {token.metaData?.name}
                          </p>
                          <div className="group/tooltip flex flex-row items-center text-sm font-600">
                            Address:{" "}
                            <p className="text-accent mr-4">
                              {shortenHash(token.address)}
                            </p>
                            <div className="flex flex-row-reverse w-full">
                              {copiedAddress === token.address ? (
                                <LuCopyCheck
                                  size={14}
                                  className="hover:cursor-copy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    navigator.clipboard.writeText(
                                      token.address
                                    );
                                    setCopiedAddress(token.address);
                                  }}
                                />
                              ) : (
                                <LuCopy
                                  size={14}
                                  className="hover:cursor-copy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    navigator.clipboard.writeText(
                                      token.address
                                    );
                                    setCopiedAddress(token.address);
                                  }}
                                />
                              )}
                            </div>
                            <Tooltip
                              isHidden={true}
                              text={token.address}
                              className="-translate-y-10 p-2"
                              innerClassName=" md:p-2"
                            />
                          </div>
                          <div className="flex flex-row text-sm font-600">
                            Balance:{" "}
                            <p
                              className={`${
                                fetchStates.allTokenData
                                  ? "animate-pulse-fast text-red-600"
                                  : "text-accent"
                              }`}
                            >
                              {token.balance}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                {filteredTokens.map((token: TokenData, index: number) => {
                  return (
                    <li
                      className="flex first:rounded-t-2xl flex-row p-2 items-center bg-transparent hover:bg-background hover:cursor-pointer last:rounded-b-2xl"
                      key={index}
                      onClick={(e) => {
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
                      <div className="flex flex-col w-full">
                        <p className="whitespace-nowrap">
                          {token.metaData.name}
                        </p>
                        <div className="group/tooltip flex flex-row items-center text-sm font-600">
                          Address:{" "}
                          <p className="text-accent mr-4">
                            {shortenHash(token.address)}
                          </p>
                          <div className="flex flex-row-reverse w-full">
                            {copiedAddress === token.address ? (
                              <LuCopyCheck
                                size={14}
                                className="hover:cursor-copy"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  navigator.clipboard.writeText(token.address);
                                  setCopiedAddress(token.address);
                                }}
                              />
                            ) : (
                              <LuCopy
                                size={14}
                                className="hover:cursor-copy"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  navigator.clipboard.writeText(token.address);
                                  setCopiedAddress(token.address);
                                }}
                              />
                            )}
                          </div>
                          <Tooltip
                            isHidden={true}
                            text={token.address}
                            className="-translate-y-10 p-2"
                            innerClassName=" md:p-2"
                          />
                        </div>
                        <div className="flex flex-row text-sm font-600">
                          Balance:{" "}
                          <p
                            className={`${
                              fetchStates.allTokenData
                                ? "animate-pulse-fast text-red-600"
                                : "text-accent"
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
