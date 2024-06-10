import { ReactNode, createContext, useContext, useEffect } from "react";
import { useState } from "react";
import Toast, {
  ToastData,
  ToastTypes,
} from "../components/BaseComponents/Toast";
import { AnimatePresence } from "framer-motion";

export {type ToastData, ToastTypes} from "../components/BaseComponents/Toast"
export type ToastContextType = {
  open: (
    data: {
      title: string;
      type: ToastTypes;
      message: string;
      url?: string;
      urlText?: string;
    },
    timeout: number
  ) => void;
  close: (id: number) => void;
};

export const ToastContext = createContext<ToastContextType>({} as ToastContextType);

//Custom Toast Implementation for the UI
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const open = (
    data: {
      title: string;
      type: ToastTypes;
      message: string;
      url?: string;
      urlText?: string;
    },
    timeout = 5000
  ) => {
    const id = Date.now();

    setToasts((toasts: ToastData[]) => [...toasts, { ...data, id }]);

    setTimeout(() => close(id), timeout);
  };

  const close = (id: number) => {
    setToasts((toasts: any) =>
      toasts.filter((toast: ToastData) => toast.id !== id)
    );
  };

  return (
    <ToastContext.Provider value={{ open, close }}>
      {children}
      <div className="flex flex-col space-y-2 max-w-[90%]  absolute top-20 z-[10] right-4 pl-10 overflow-hidden">
        <AnimatePresence>
          {toasts.map((toast: ToastData) => (
            <Toast key={toast.id} toast={toast} close={close} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

