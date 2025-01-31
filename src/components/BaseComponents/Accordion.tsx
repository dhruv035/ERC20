import { Dispatch, SetStateAction } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const Accordion = ({
  isOpen,
  setIsOpen,
  header,
  children,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  header: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`flex flex-col rounded-2xl border-2 border-accent bg-background p-4`}
    >
      <div
        onClick={(e) => {
          setIsOpen((prevState) => !prevState);
        }}
        className="flex flex-row hover:cursor-pointer"
      >
        <p className="text-nowrap text-accent">{header}</p>
        <div className="flex w-full flex-row-reverse">
          <MdOutlineKeyboardArrowDown
            className={`duration-800 origin-center transition-all ${
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
