import { TokenData } from "@/app/page";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { shortenHash } from "@/app/actions/utils";
import { LuCopy, LuCopyCheck, LuTrash2 } from "react-icons/lu";
const TokenList = ({
  tokens,
  isImported,
  isUpdating,
  setToken,
  setIsOpen,
  deleteImportedToken,
}: {
  tokens: TokenData[];
  isImported: boolean;
  isUpdating: boolean;
  setToken: (token: TokenData) => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  deleteImportedToken?: (
    address: string,
  ) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string>();
  return (
    <div className="w-full">
      {tokens.map((token: TokenData, index: number) => {
        return (
          <li
            className="flex flex-col items-center bg-transparent p-4 first:rounded-t-2xl last:rounded-b-2xl hover:cursor-pointer hover:bg-background md:flex-row"
            key={index}
            onClick={(e) => {
              setIsOpen(false);
              setToken(token);
            }}
          >
            <div className="w-8 h-8 md:w-[40px] md:h-[40px] mx-2 rounded-full shadow-fuller shadow-gray-200">
            <Image
              className="rounded-full"
              src={token.metaData?.logo ?? "https://picsum.photos/200"}
              alt=""
             
              width={30}
              height={30}
            ></Image>
            </div>
            <div className="flex w-full flex-col items-center md:items-stretch">
              <div className="flex flex-col-reverse items-center md:flex-row">
                <div className="flex flex-col items-center md:flex-row whitespace-nowrap">
                  {token.metaData?.name}{" "}
                  {isImported && (
                    <p className="md:ml-2 content-center rounded-xl border-[1px] border-accent bg-transparent px-1 text-xs text-accent opacity-70">
                      Imported
                    </p>
                  )}
                </div>
                {isImported && deleteImportedToken && (
                  <div className="flex w-full justify-center md:justify-stretch md:flex-row-reverse">
                    <button
                      className="md:ml-2 text-red-400"
                      onClick={deleteImportedToken(token.address)}
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                )}
              </div>
              <div className="font-600 group flex flex-row items-center text-sm">
                <p className="hidden md:flex"> Address: </p>
                <p className="text-accent md:mr-4">
                  {shortenHash(token.address)}
                </p>
                <div className="flex w-full flex-col text-xs md:flex-row-reverse md:text-sm">
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
                <p className="">Balance:{" "}</p>
                <p
                  className={`${
                    isUpdating
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
  );
};

export default TokenList;
