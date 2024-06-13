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
import { isAddress, isAddressEqual } from "viem";
import Modal from "../../BaseComponents/Modal";
import { Button, Spinner, Toggle } from "../../BaseComponents";
import useAlchemyHooks from "@/app/actions/useAlchemyHooks";
import { useAccount, useBlockNumber } from "wagmi";
import { FaCircle } from "react-icons/fa";
import TokenList from "./TokenList";
import TokenMetadata from "./TokenMetadata";
import {
  addToken,
  getTokensBook,
  removeToken,
} from "@/app/actions/localStorage/tokensBook";

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
  const [input, setInput] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customToken, setCustomToken] = useState<TokenData | undefined>();

  const [tokens, setTokens] = useState<TokenData[]>();
  const [importedTokens, setImportedTokens] = useState<TokenData[]>();
  const [importedTokensArray, setImportedTokensArray] = useState<string[]>();

  const { address, chainId } = useAccount();
  const { data: blockNumber } = useBlockNumber({
    query: {
      refetchInterval: 6_000,
      staleTime: 5_000,
    },
  });

  //Alchemy Hooks
  const {
    getAllTokenData,
    getTokenDataArray,
    getTokenData,
    initializeStates,
    fetchStates,
  } = useAlchemyHooks();

  //Functions
  const handleStorageUpdate = useCallback(
    (event: StorageEvent) => {
      if (event.key === `tokensBook:${chainId}`) {
        if (!event.newValue) {
          setImportedTokensArray([]);
          return;
        }
        const importedTokens: Array<string> = JSON.parse(event.newValue);
        setImportedTokensArray(importedTokens);
      }
    },
    [chainId],
  );

  const addLocalToken = useCallback(
    (input: string) => addToken(chainId)(input),
    [chainId],
  );
  const removeLocalToken = useCallback(
    (input: string) => removeToken(chainId)(input),
    [chainId],
  );

  const handleImport = useCallback(async () => {
    if (!customToken) return;
    if (!chainId) return;
    const arr = addLocalToken(input);
    setImportedTokensArray(arr);
    setIsCustom(false);
    setInput("");
  }, [input, customToken, chainId, addLocalToken]);

  const filterData = useCallback(
    (tokens: TokenData[] | undefined) => {
      if (!tokens) return [] as TokenData[];
      if (input === "") return tokens;
      return tokens.filter((token) => {
        return (
          token.metaData.name?.toLowerCase().startsWith(input.toLowerCase()) ||
          token.metaData.symbol
            ?.toLowerCase()
            .startsWith(input.toLowerCase()) ||
          (isAddress(input)
            ? isAddressEqual(
                token.address as `0x${string}`,
                input as `0x${string}`,
              )
            : false)
        );
      });
    },
    [input],
  );

  //Memos
  //Memos
  const filteredImportedTokens = useMemo(() => {
    return filterData(importedTokens);
  }, [filterData, importedTokens]);

  const filteredTokens = useMemo(() => {
    return filterData(tokens);
  }, [filterData, tokens]);

  //Local index is kept as the string and parsed when passed to the state in sideEffect

  const importedTokensLocal = useMemo<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    } else {
      return getTokensBook(chainId);
    }
  }, [chainId]);

  const isValid = useMemo<boolean>(() => {
    return isAddress(input);
  }, [input]);
  //Effects

  //Reset Search Text
  useEffect(() => {
    setInput("");
  }, [isOpen]);

  useEffect(() => {
    if (importedTokensLocal && importedTokensLocal.length > 0) {
      setImportedTokensArray(importedTokensLocal);
    }
  }, [importedTokensLocal]);

  const getAlchemyDataArray = useCallback(() => {
    if (importedTokensArray) {
      console.log("IMPOLOCO", importedTokensArray);
      if (importedTokensArray.length > 0)
        getTokenDataArray(importedTokensArray).then((data) => {
          setImportedTokens(data);
        });
      else setImportedTokens([]);
    }
  }, [importedTokensArray]);
  useEffect(() => {
    getAlchemyDataArray();
  }, [getAlchemyDataArray]);

  //Refresh data every block
  useEffect(() => {
    if (!blockNumber) return;
    if (!address) return;
    getAllTokenData().then((data) => {
      setTokens(data);
    });
  }, [blockNumber, address, getAllTokenData]);

  useEffect(() => {
    setTokens([]);
    setImportedTokens([]);
  }, [chainId]);
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
            disabled={
              !isValid ||
              fetchStates.tokenData ||
              customToken?.metaData.name === ""
            }
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
                        const data = removeLocalToken(address);
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
