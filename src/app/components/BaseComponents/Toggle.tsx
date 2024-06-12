import { IconType } from "react-icons";

const Toggle = ({
  isTrue,
  toggle,
  trueImage: TrueImage,
  falseImage: FalseImage,
  id,
}: {
  isTrue: boolean;
  toggle: () => void;
  trueImage: IconType;
  falseImage: IconType;
  id: string;
}) => {
  return (
    <div
      className={`group/toggle mr-2 select-none rounded-full p-[1px] text-text shadow-fuller shadow-gray-600 hover:cursor-pointer hover:bg-base-green hover:text-base-green md:mr-8 nohover:hover:bg-navbar nohover:hover:text-gray-600`}
    >
      <div
        onClick={(e) => {
          toggle();
        }}
        className={`flex h-min py-[0.2px] flex-row${
          isTrue ? "-reverse" : ""
        } w-6 rounded-full bg-background xs:w-10 md:w-14`}
      >
        {!isTrue ? (
          <FalseImage
            className={`h-[10px] w-[10px] rounded-full bg-background text-text shadow-fuller shadow-gray-600 group-hover/toggle:text-accent group-hover/toggle:shadow-accent xs:h-4 xs:w-4 md:h-6 md:w-6 nohover:text-accent nohover:shadow-accent`}
          />
        ) : (
          <TrueImage
            className={`h-[10px] w-[10px] rounded-full bg-background text-text shadow-fuller shadow-gray-600 group-hover/toggle:text-accent group-hover/toggle:shadow-accent xs:h-4 xs:w-4 md:h-6 md:w-6 nohover:text-accent nohover:shadow-accent`}
          />
        )}
      </div>
    </div>
  );
};

export default Toggle;
