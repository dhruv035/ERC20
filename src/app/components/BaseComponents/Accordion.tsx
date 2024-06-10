import { Dispatch, SetStateAction, useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const Accordion = ({
  isOpen,
  setIsOpen,
  header,
  children
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  header: string;
  children:React.ReactNode

}) => {
  return (
    <div
      className={`flex rounded-2xl flex-col p-4 bg-background border-accent border-2`}
    >
      <div
        onClick={(e) => {
          setIsOpen((prevState) => !prevState);
        }}
        className=" flex flex-row hover:cursor-pointer"
      >
        <p className="text-nowrap text-accent">{header}</p>
        <div className="flex flex-row-reverse w-full">
          <MdOutlineKeyboardArrowDown
            className={`transition-all duration-800 origin-center ${
              isOpen ? "" : "rotate-90"
            }`}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default Accordion;
