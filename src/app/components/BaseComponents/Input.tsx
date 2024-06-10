import { ChangeEvent} from "react";

const Input = ({
  type,
  placeholder,
  value,
  onChange,
  onClick,
  disabled,
  className,
  boxClassName,
  label,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  boxClassName?:string;
  label?:string;
}) => {
  return (
    <div className={`group ${label} my-2 flex flex-col ${boxClassName}`}>
      {
        label && <p className={`transition ease-in-out origin-left font-bold text-accent group-focus-within/${label}:scale-[0.75]`}>
        {label}
      </p>
      }
    <input
      id="amount"
      disabled={disabled}
      autoCorrect="off"
      autoComplete="off"
      className={`m-2 px-2 py-1 rounded-full text-md w-full outline-none overflow-hidden bg-gray-200 placeholder placeholder-text ${disabled?"bg-gray-400":""}  ${className}`}
      type={type}
      value={value}
      onClick={(e) => {
        onClick && onClick(e);
      }}
      onChange={(e) => {
        onChange && onChange(e);
      }}
      placeholder={placeholder}
    />
    </div>
  );
};
export default Input;
