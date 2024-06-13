import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { Button, Input, Modal, Toggle } from "../BaseComponents";
import { FaCircle } from "react-icons/fa";
import { isAddress } from "viem";

const AddressBookModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isNew, setIsNew] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");


  const handleAddContact = useCallback(()=>{
  },[])
  const isValid = useMemo(() => {
    return isAddress(input);
  }, [input]);


  // Add Contact data type and update addressbook local Storage
  // Add Display Component for the address book
  // Add form for address book new Contact
  
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="text-2xl text-white">Select a Token</p>
      <div className="mt-4 flex w-8/12 flex-row items-center justify-center text-center">
        <p
          className={`w-4/12 text-sm font-bold ${!isNew ? "text-accent" : ""}`}
        >
          Search Addresses
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
          Import token
        </p>
      </div>
      {isNew ? (
        <div className="flex flex-col items-center">
          <Input
            className="text-black placeholder-gray-700 placeholder:italic"
            boxClassName="items-center"
            placeholder="Search Contacts"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button
            disabled={
              !isValid
            }
            onClick={(e) => {
              handleAddContact()
            }}
          >
            {"Import token"}
          </Button>
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
                {/**
                 
                 */}
              </div>
            </ul>
          }
        </div>
      )}
    </Modal>
  );
};

export default AddressBookModal;
