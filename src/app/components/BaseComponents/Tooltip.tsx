//Place this component inside a component to create a tooltip over it
//Add group/tooltip to the parent component to bind the hover correctly
const Tooltip = ({ isHidden, text,className, innerClassName }: { isHidden: boolean; text: string;className?:string, innerClassName?:string }) => {
  return (
    <div
      className={`absolute hidden p-4 z-[100] -translate-y-28 ${
        isHidden ? "group-hover/tooltip:flex" : ""
      } ${className}`}
    >
      <div className={`relative w-full rounded-2xl text-text-base flex bg-gray-600 p-2 md:p-4 ${innerClassName}`}>
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
