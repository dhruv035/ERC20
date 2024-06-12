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
import { Spinner } from "../../BaseComponents";
import useAlchemyHooks from "@/app/actions/useAlchemyHooks";
import { shortenHash } from "@/app/actions/utils";
import { LuCopy } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";
import Tooltip from "../../BaseComponents/Tooltip";
import { useAccount, useBlockNumber } from "wagmi";

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
  }, [window]);
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
  }, [importedTokensArray, importedTokensLocal]);

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
  }, [input]);
  useEffect(() => {
    if (!isCustom) return;
    if (!isValid) {
      setCustomToken(undefined);
      return;
    }
    getTokenData(input).then((tokenData) => {
      if (tokenData) setCustomToken(tokenData);
    });
  }, [isValid, isCustom]);

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
      <p className="mt-4 text-2xl text-white">Select a Token</p>
      <div className="flex flex-row">
        <p className="mr-4 w-full origin-left font-bold text-accent transition ease-in-out sm:w-fit">
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
            className="text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-center"
            placeholder="Enter token Address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            disabled={!isValid || fetchStates.tokenData}
            onClick={(e) => {
              handleImport();
            }}
            className={`mb-4 mr-1 flex w-full max-w-[90px] flex-row items-center whitespace-nowrap rounded-full border-[1px] border-background bg-background p-1 text-xs text-text shadow-fuller shadow-shadow enabled:hover:border-accent enabled:hover:text-accent enabled:hover:shadow-accent sm:mr-4 sm:p-2 nohover:text-accent nohover:shadow-accent`}
          >
            {"Import token"}
          </button>
          {fetchStates.tokenData && <Spinner />}
          {/*className={`flex flex-row w-full max-w-[90px] mr-1 mb-4 p-1 rounded-full border-[1px] border-background sm:p-2 sm:mr-4 items-center bg-background shadow-shadow shadow-fuller text-text text-xs whitespace-nowrap enabled:hover:border-accent enabled:hover:shadow-accent enabled:hover:text-accent nohover:text-accent nohover:shadow-accent`} */}
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
                {importedTokens &&
                  importedTokens.map((token: TokenData, index: number) => {
                    return (
                      <li
                        className="flex flex-row items-center bg-transparent p-2 first:rounded-t-2xl last:rounded-b-2xl hover:cursor-pointer hover:bg-background"
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
                        <div className="flex w-full flex-col">
                          <div className="flex flex-row">
                            <div className="flex flex-row whitespace-nowrap">
                              {token.metaData?.name}{" "}
                              <p className="ml-2 justify-center border-[1px] border-gray-400 bg-transparent px-1 text-xs text-gray-400">
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
                                X
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
                  })}
                {filteredTokens.map((token: TokenData, index: number) => {
                  return (
                    <li
                      className="flex flex-row items-center bg-transparent p-2 first:rounded-t-2xl last:rounded-b-2xl hover:cursor-pointer hover:bg-background"
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
