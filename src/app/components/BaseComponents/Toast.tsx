import { m } from "framer-motion";

export enum ToastTypes {
  PENDING = "pending",
  ERROR = "error",
  SUCCESS = "successful",
  ALERT = "alert",
}
export type ToastData = {
  id: number;
  title: string;
  type: ToastTypes;
  message: string;
  url?: string;
  urlText?: string;
};

const Toast = ({
  toast,
  close,
}: {
  toast: ToastData;
  close: (id: number) => void;
}) => {
  return (
    <m.div
      initial={{ opacity: 0, translateX: 100, scale: 0 }}
      animate={{ opacity: 1, translateX: 0, scale: 1 }}
      exit={{
        opacity: 0,
        translateX: 100,
        transition: { duration: 0.3 },
      }}
      className={`relative rounded-2xl p-4 overflow-hidden text-start min-w-[200px] max-w-[100%] md:max-w-[600px] ${
        toast.type === ToastTypes.ALERT
          ? "bg-yellow-400"
          : toast.type === ToastTypes.ERROR
          ? "bg-red-400"
          : toast.type === ToastTypes.SUCCESS
          ? "bg-green-400"
          : "bg-gray-400"
      }`}
    >
      <div className="flex flex-row-reverse">
        <button
          onClick={() => close(toast.id)}
          className="ml-4 top-2 right-2 p-1 rounded-lg bg-gray-200/20 text-gray-800/60"
        >
          X
        </button>
        <div className="text-xl w-full font-bold underline">{toast.title}</div>
      </div>
      <div className="text-sm hyphens-auto">{toast.message}</div>
      {toast.url && toast.urlText && (
        <a href={toast.url} target="_blank" className="underline">
          {toast.urlText}
        </a>
      )}
    </m.div>
  );
};

export default Toast;
