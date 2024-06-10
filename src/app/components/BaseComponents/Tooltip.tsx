//Place this component inside a component to create a tooltip over it
//Add group/tooltip to the parent component to bind the hover correctly
const Tooltip = ({ isHidden, text }: { isHidden: boolean; text: string }) => {
  return (
    <div
      className={`absolute hidden group-hover/tooltip:group-disabled/tooltip:flex p-4 z-[1] -translate-y-28 ${
        isHidden ? "hidden" : ""
      }`}
    >
      <div className="relative w-full rounded-2xl text-text-base flex bg-accent p-2 md:p-4">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;