import { useState } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

const CopyIcon = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  if (isCopied)
    return (
      <LuCopyCheck
        size={14}
        className="hover:cursor-copy"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleClick();
        }}
      />
    );
  else
    return (
      <LuCopy
        size={14}
        className="hover:cursor-copy"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleClick();
        }}
      />
    );
};


export default CopyIcon;