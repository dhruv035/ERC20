const Button = ({
  disabled,
  onClick,
  className,
  children,
}: {
  disabled: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`mb-4 mr-1 flex w-full max-w-[90px] flex-row items-center whitespace-nowrap rounded-full border-[1px] border-background bg-background p-1 text-xs text-text shadow-fuller shadow-shadow enabled:hover:border-accent enabled:hover:text-accent enabled:hover:shadow-accent sm:mr-4 sm:p-2 nohover:text-accent nohover:shadow-accent ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
