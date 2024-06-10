import { Dispatch, SetStateAction, useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref?.current?.contains(event.target as HTMLElement)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, [ref, setIsOpen]);
  if (!isOpen) return <div></div>;
  return (
    <div className="w-full px-10 h-full bg-gray-900 bg-opacity-30 fixed z-[20] top-0 right-0 flex justify-center items-center">
      <div className=" flex p-[2px] w-[90%] max-w-[600px] bg-text rounded-md">
        <div
          ref={ref}
          className="flex flex-col bg-modal rounded-md h-96 w-full items-center shadow-md"
        >
          <div
            onClick={() => setIsOpen(false)}
            className="w-full flex flex-row-reverse mr-10 mt-2 text-xl hover:cursor-pointer"
          >
            X
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
