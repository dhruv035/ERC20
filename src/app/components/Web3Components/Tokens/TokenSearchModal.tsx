import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TokenData } from "../../../page";
import Image from "next/image";
import Input from "../../BaseComponents/Input";
import { isAddress } from "viem";
import Modal from "../../BaseComponents/Modal";
import { addToken, removeToken } from "@/app/actions/localStorageUtils";
import { Button, Spinner, Toggle } from "../../BaseComponents";
import useAlchemyHooks from "@/app/actions/useAlchemyHooks";
import { shortenHash } from "@/app/actions/utils";
import { LuCircle, LuCopy, LuTrash2 } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";
import { useAccount, useBlockNumber } from "wagmi";
import { FaCircle } from "react-icons/fa";

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
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({
    query: {
      refetchInterval: 6_000,
      staleTime: 5_000,
    },
  });
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  const {
    getAllTokenData,
    getTokenDataArray,
    initializeStates,
    getTokenData,
    fetchStates,
  } = useAlchemyHooks();
  const [importedTokens, setImportedTokens] = useState<TokenData[]>();
  const [importedTokensArray, setImportedTokensArray] = useState<string[]>();

  const filteredImportedTokens = useMemo(() => {
    if (!importedTokens) return [] as TokenData[];
    if (input === "") return importedTokens;
    const filteredData = importedTokens.filter((token) => {
      return (
        token.metaData.name?.toLowerCase().startsWith(input.toLowerCase()) ||
        token.metaData.symbol?.toLowerCase().startsWith(input.toLowerCase())
      );
    });
    return filteredData;
  }, [input, importedTokens]);

  console.log("importedTokensArray", importedTokensArray);
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

  //Local index is kept as the string and parsed when passed to the state in sideEffect

  const importedTokensLocal = useMemo<string[]>(() => {
    console.log("123:IMPORTED");
    if (typeof window === "undefined") {
      return [];
    } else {
      const data = localStorage.getItem("tokensBook");
      if (data && data !== "") return JSON.parse(data);
    }
  }, []);
  //Reset Search Text
  useEffect(() => {
    setInput("");
  }, [isOpen]);

  useEffect(() => {
    if (importedTokensArray) {
      if (importedTokensArray.length > 0)
        getTokenDataArray(importedTokensArray).then((data) =>
          setImportedTokens(data),
        );
      else setImportedTokens([]);
      //Fetch data for imported tokens, alchemy hook getTokensArray
    } else if (importedTokensLocal && importedTokensLocal.length > 0) {
      setImportedTokensArray(importedTokensLocal);
    }
  }, [importedTokensArray, importedTokensLocal, getTokenDataArray]);

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
    const arr = addToken(input);
    setImportedTokensArray(arr);
    setIsCustom(false);
    setInput("");
  }, [input, customToken]);

  const isValid = useMemo<boolean>(() => {
    if (!isCustom) return false;
    return isAddress(input);
  }, [input, isCustom]);
  useEffect(() => {
    if (!isCustom) return;
    if (!isValid) {
      setCustomToken(undefined);
      return;
    }
    getTokenData(input).then((tokenData) => {
      if (tokenData) setCustomToken(tokenData);
    });
  }, [isValid, isCustom, input, getTokenData]);

  const handleStorageUpdate = useCallback((event: StorageEvent) => {
    if (event.key === "tokensBook") {
      if (!event.newValue) {
        setImportedTokensArray([]);
        return;
      }
      const importedTokens: Array<string> = JSON.parse(event.newValue);
      setImportedTokensArray(importedTokens);
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
      <p className="text-2xl text-white">Select a Token</p>
      <div className="mt-4 flex w-8/12 flex-row items-center justify-center text-center">
        <p
          className={`w-4/12 text-sm font-bold ${!isCustom ? "text-accent" : ""}`}
        >
          Search Tokens
        </p>

        <div className="max-w-4/12 items-center">
          <Toggle
            className="mr-0 shadow-shadow md:mr-0"
            isTrue={isCustom}
            toggle={() => {
              setInput("");
              setIsCustom((prevState) => !prevState);
            }}
            falseImage={<FaCircle className="h-full w-full text-white" />}
            trueImage={<FaCircle className="h-full w-full text-accent" />}
          />
        </div>
        <p
          className={`w-4/12 text-sm font-bold ${isCustom ? "text-accent" : ""}`}
        >
          Import token
        </p>
      </div>
      {isCustom ? (
        <div className="flex flex-col items-center">
          <Input
            className="text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-center"
            placeholder="Enter token Address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button
            disabled={!isValid || fetchStates.tokenData}
            onClick={(e) => {
              handleImport();
            }}
          >
            {"Import token"}
          </Button>
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
        <div className="flex w-7/12 flex-col items-center">
          <Input
            className="text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-center"
            placeholder="Search token"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {!initializeStates.allTokenData ? (
            <Spinner />
          ) : (
            <ul className="no-scrollbar flex h-fit max-h-[200px] w-full justify-center overflow-scroll rounded-2xl border-[1px] border-white bg-transparent">
              <div className="flex w-full max-w-96 flex-col rounded-2xl">
                {filteredImportedTokens &&
                  filteredImportedTokens.map(
                    (token: TokenData, index: number) => {
                      return (
                        <li
                          className="flex flex-row items-center bg-transparent p-4 first:rounded-t-2xl last:rounded-b-2xl hover:cursor-pointer hover:bg-background"
                          key={index}
                          onClick={(e) => {
                            setIsOpen(false);
                            setToken(token);
                          }}
                        >
                          <Image
                            className="mx-2 rounded-[100%] shadow-fuller shadow-gray-200"
                            src={
                              token.metaData?.logo ??
                              "https://picsum.photos/200"
                            }
                            alt=""
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                            width={30}
                            height={30}
                          ></Image>
                          <div className="flex w-full flex-col">
                            <div className="flex flex-row">
                              <div className="flex flex-row whitespace-nowrap">
                                {token.metaData?.name}{" "}
                                <p className="ml-2 content-center rounded-xl border-[1px] border-accent bg-transparent px-1 text-xs text-accent opacity-70">
                                  Imported
                                </p>
                              </div>
                              <div className="flex w-full flex-row-reverse">
                                <button
                                  className="ml-2 text-red-400"
                                  onClick={(e) => {
                                    console.log("HEREPREVSTATE");
                                    e.stopPropagation();
                                    const data = removeToken(token.address);
                                    setImportedTokensArray(data);
                                  }}
                                >
                                  <LuTrash2 />
                                </button>
                              </div>
                            </div>
                            <div className="font-600 group flex flex-row items-center text-sm">
                              Address:{" "}
                              <p className="mr-4 text-accent">
                                {shortenHash(token.address)}
                              </p>
                              <div className="flex w-full flex-row-reverse">
                                {copiedAddress === token.address ? (
                                  <LuCopyCheck
                                    size={14}
                                    className="hover:cursor-copy"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      navigator.clipboard.writeText(
                                        token.address,
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
                                        token.address,
                                      );
                                      setCopiedAddress(token.address);
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="font-600 flex flex-row text-sm">
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
                    },
                  )}
                {filteredTokens.map((token: TokenData, index: number) => {
                  return (
                    <li
                      className="flex flex-row items-center bg-transparent p-4 first:rounded-t-2xl last:rounded-b-2xl hover:cursor-pointer hover:bg-background"
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
                      <div className="flex w-full flex-col">
                        <p className="whitespace-nowrap">
                          {token.metaData.name}
                        </p>
                        <div className="font-600 group flex flex-row items-center text-sm">
                          Address:{" "}
                          <p className="mr-4 text-accent">
                            {shortenHash(token.address)}
                          </p>
                          <div className="flex w-full flex-row-reverse">
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
                        </div>
                        <div className="font-600 flex flex-row text-sm">
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
