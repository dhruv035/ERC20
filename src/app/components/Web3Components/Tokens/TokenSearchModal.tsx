import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TokenData } from "../../../page";
import Input from "../../BaseComponents/Input";
import { isAddress } from "viem";
import Modal from "../../BaseComponents/Modal";
import { addToken, removeToken } from "@/app/actions/localStorageUtils";
import { Button, Spinner, Toggle } from "../../BaseComponents";
import useAlchemyHooks from "@/app/actions/useAlchemyHooks";
import { useAccount, useBlockNumber } from "wagmi";
import { FaCircle } from "react-icons/fa";
import TokenList from "./TokenList";
import TokenMetadata from "./TokenMetadata";

//I had previously factored this into a seperate Modal component but there is no re usage of Modal
const TokenSearchModal = ({
  isOpen,
  setIsOpen,
  setToken,
}: {
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
            customToken && <TokenMetadata token={customToken} />
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

          {
            <ul className="no-scrollbar flex h-fit max-h-[200px] w-full justify-center overflow-scroll rounded-2xl border-[1px] border-white bg-transparent">
              <div className="flex w-full max-w-96 flex-col items-center rounded-2xl">
                {filteredImportedTokens.length > 0 &&
                  (!initializeStates.tokenDataArray ? (
                    <Spinner className="my-4" />
                  ) : (
                    <TokenList
                      tokens={filteredImportedTokens}
                      isUpdating={fetchStates.tokenDataArray}
                      isImported={true}
                      setToken={setToken}
                      setIsOpen={setIsOpen}
                      deleteImportedToken={(address) => (e) => {
                        e.stopPropagation();
                        const data = removeToken(address);
                        setImportedTokensArray(data);
                      }}
                    />
                  ))}
                {filteredTokens.length > 0 &&
                  (!initializeStates.allTokenData ? (
                    <Spinner className="my-4" />
                  ) : (
                    <TokenList
                      tokens={filteredTokens}
                      isUpdating={fetchStates.allTokenData}
                      isImported={false}
                      setToken={setToken}
                      setIsOpen={setIsOpen}
                    />
                  ))}
              </div>
            </ul>
          }
        </div>
      )}
    </Modal>
  );
};

export default TokenSearchModal;
