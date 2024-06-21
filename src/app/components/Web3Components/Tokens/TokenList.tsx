import { TokenData } from "@/app/page";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { shortenHash } from "@/app/actions/utils";
import { LuCopy, LuCopyCheck, LuTrash2 } from "react-icons/lu";
import CopyIcon from "../../BaseComponents/CopyIcon";
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
            <Image
              className="mr-4 w-[50px] rounded-full shadow-fuller shadow-gray-200"
              src={token.metaData?.logo ?? "https://picsum.photos/200"}
              alt=""
              width={30}
              height={30}
            ></Image>

            <div className="flex w-full flex-col items-center md:items-stretch">
              <div className="flex flex-col-reverse items-center md:flex-row">
                <div className="flex flex-col items-center whitespace-nowrap md:flex-row">
                  {token.metaData?.name}{" "}
                  {isImported && (
                    <p className="content-center rounded-xl border-[1px] border-accent bg-transparent px-1 text-xs text-accent opacity-70 md:ml-2">
                      Imported
                    </p>
                  )}
                </div>
                {isImported && deleteImportedToken && (
                  <div className="flex w-full justify-center md:flex-row-reverse md:justify-stretch">
                    <button
                      className="text-red-400 md:ml-2"
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
                  <CopyIcon text={token.address} />
                </div>
              </div>
              <div className="font-600 flex flex-row text-sm">
                <p className="">Balance: </p>
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
