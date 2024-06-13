import { AnimatePresence, m } from "framer-motion";
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setIsOpen]);
  return (
    <AnimatePresence>
      {isOpen ? (
        <m.div
          key="modal"
          initial={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, translateY: 100, transition: { duration: 0.3 } }}
          className="fixed right-0 top-0 z-[20] flex h-full w-full items-center justify-center bg-gray-900 bg-opacity-30 px-10"
        >
          <div className="flex w-[90%] max-w-[600px] rounded-md bg-text p-[2px] overflow-hidden">
            <div
              ref={ref}
              className="flex h-96 w-full flex-col items-center rounded-md bg-modal shadow-md"
            >
              <div
                onClick={() => setIsOpen(false)}
                className="mr-10 mt-2 flex w-full flex-row-reverse text-xl hover:cursor-pointer"
              >
                X
              </div>
              {children}
            </div>
          </div>
        </m.div>
      ) : (
        <div key="none"></div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
