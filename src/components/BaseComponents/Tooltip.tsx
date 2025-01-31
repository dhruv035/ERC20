//Place this component inside a component to create a tooltip over it
//Add group/tooltip to the parent component to bind the hover correctly
const Tooltip = ({
  isHidden,
  text,
  className,
  innerClassName,
}: {
  isHidden: boolean;
  text: string;
  className?: string;
  innerClassName?: string;
}) => {
  return (
    <div
      className={`absolute z-[100] hidden -translate-y-28 p-4 ${
        isHidden ? "group-hover/tooltip:flex" : ""
      } ${className}`}
    >
      <div
        className={`relative flex w-full rounded-2xl bg-gray-600 p-2 text-text-base md:p-4 ${innerClassName}`}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
