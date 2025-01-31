import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Input, Modal, Toggle } from "../BaseComponents";

import { FaCircle, FaTrash } from "react-icons/fa";
import { isAddress } from "viem";
import { addAddress, getAddressBook, removeAddress } from "@/lib/localStorage/addressBook";
import { AddressBook } from "@/lib/types";
import { shortenHash } from "@/lib/utils";
import { LuTrash2 } from "react-icons/lu";
import Tooltip from "../BaseComponents/Tooltip";

const AddressBookModal = ({
  isOpen,
  setIsOpen,
  setAddress
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setAddress: (address: string) => void;
}) => {
  const [isNew, setIsNew] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [name, setName] = useState<string>();
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const [addressBook, setAddressBook] = useState<Array<AddressBook>>();

  useEffect(() => {
    const data = getAddressBook();
    setAddressBook(data);
  }, []);

  const handleAddAddress = (address: string) => {
    if(!name||name==="") return;
    addAddress(address,name);
    setAddressBook(getAddressBook());
    setIsNew(false);
    setInput("");
    setName("");
  };
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === "addressBook") {
      setAddressBook(JSON.parse(event.newValue as string));
    }
  };
  useEffect(() => {
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [handleStorageEvent]);

  // Add Contact data type and update addressbook local Storage
  // Add Display Component for the address book
  // Add form for address book new Contact

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="text-2xl text-white">Add Contact</p>
      <div className="mt-4 flex w-8/12 flex-row items-center justify-center text-center">
        <p
          className={`w-4/12 text-sm font-bold ${!isAdding ? "text-accent" : ""}`}
        >
          Search Address
        </p>
        <div className="max-w-4/12 items-center">
          <Toggle
            className="mr-0 shadow-shadow md:mr-0"
            isTrue={isNew}
            toggle={() => {
              setInput("");
              setIsNew((prevState) => !prevState);
            }}
            falseImage={<FaCircle className="h-full w-full text-white" />}
            trueImage={<FaCircle className="h-full w-full text-accent" />}
          />
        </div>
        <p className={`w-4/12 text-sm font-bold ${isNew ? "text-accent" : ""}`}>
          Add address
        </p>
      </div>
      {isNew ? (
        <div className="flex flex-col items-center">
          <Input
            className="text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-baseline"
            label="Name"
            placeholder="Enter Name"
            errorMessage={"Error:Name is required"}
            isError={name===""}
            value={name?name:""}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            className="mb-[0px] text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-baseline"
            label="Address"
            placeholder="Wallet Address"
            value={input}
            errorMessage={"Error:Input is not a valid address"}
            isError={(!!input&&input!==""&&!isAddress(input))}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <Button
            disabled={!isAddress(input)||!name ||name===""}
            onClick={(e) => {
              handleAddAddress(input);
            }}
          >
            {"Add Address"}
          </Button>
        </div>
      ) : (
        <div className="flex w-7/12 flex-col items-center mb-2">
          <Input
            className="text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-center"
            placeholder="Search token"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {
            <ul className="no-scrollbar  hover:cursor-pointer flex h-fit max-h-[200px] w-full justify-center overflow-scroll rounded-2xl border-[1px] border-white bg-transparent">
              <div className="flex w-full max-w-96 flex-col items-center rounded-2xl">
                {addressBook?.map((address, index) => {
                  return <div className="group/tooltipper flex flex-col px-2 py-2 justify-between w-full" key={index} onClick={()=>{setAddress(address.address),setIsOpen(false)}}>
                    <div className="flex flex-row justify-between w-full">
                      <div className="flex flex-row items-center">
                      <label className="text-sm font-bold">Name: </label>
                      <p>{address.name}</p>
                    </div>
                    <button onClick={(e)=>{
                      e.stopPropagation()
                      removeAddress(address.address)
                      setAddressBook(getAddressBook())
                      }}>
                      <LuTrash2 className="text-red-400"/>
                    </button>
                    </div>
                  <div className=" flex flex-row w-full items-center">
                    <label className="text-sm font-bold">Address: </label>
                    <p className="no-scrollbar overflow-x-scroll" onMouseEnter={()=>{setHoverIndex(index)}} onMouseLeave={()=>{setHoverIndex(-1)}}>{hoverIndex===index?address.address:shortenHash(address.address,5)}</p>
                    </div>
                  </div>;
                })}
              </div>
            </ul>
          }
        </div>
      )}
    </Modal>
  );
};

export default AddressBookModal;
