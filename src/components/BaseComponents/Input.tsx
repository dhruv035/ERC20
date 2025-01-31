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
  errorMessage,
  isError,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
  label?: string;
  errorMessage?: string;
  isError?: boolean;
}) => {
  return (
    <div className={`group ${label} my-2 flex flex-col ${boxClassName}`}>
      {label && (
        <p
          className={`origin-left font-bold text-accent transition ease-in-out group-focus-within/${label}:scale-[0.75]`}
        >
          {label}
        </p>
      )}
      <input
        id="amount"
        disabled={disabled}
        autoCorrect="off"
        autoComplete="off"
        className={`text-md placeholder m-2 w-full overflow-hidden rounded-full bg-gray-200 px-2 py-1 placeholder-text outline-none ${disabled ? "bg-gray-400" : ""} ${className}`}
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
       {isError && (
        <div className="text-[10px] w-full pl-2 text-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
export default Input;
