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
      className={`relative min-w-[200px] max-w-[100%] overflow-hidden rounded-2xl p-4 text-start md:max-w-[600px] bg-background text-text border-2 border-accent-base`}
    >
      <div className="flex flex-row-reverse">
        <button
          onClick={() => close(toast.id)}
          className="right-2 top-2 ml-4 rounded-lg p-1 text-text"
        >
          X
        </button>
        <div className="w-full text-xl font-bold underline">{toast.title}</div>
      </div>
      <div className="hyphens-auto text-sm">{toast.message}</div>
      {toast.url && toast.urlText && (
        <a href={toast.url} target="_blank" className="underline">
          {toast.urlText}
        </a>
      )}
    </m.div>
  );
};

export default Toast;
