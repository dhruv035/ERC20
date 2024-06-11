import { IconType } from "react-icons";

const Toggle = ({
  isTrue,
  toggle,
  trueImage: TrueImage,
  falseImage: FalseImage,
  id
}: {
  isTrue: boolean;
  toggle: () => void;
  trueImage: IconType;
  falseImage: IconType;
  id:string
}) => {


  return (
    <div className={`group/toggle select-none rounded-full p-[1px] mr-2 md:mr-8 text-text shadow-fuller hover:cursor-pointer shadow-gray-600 hover:text-base-green hover:bg-base-green nohover:hover:text-gray-600 nohover:hover:bg-navbar`}>
      <div
        onClick={(e) => {
          toggle();
        }}
        className={`py-[0.2px] h-min flex flex-row${
          isTrue ? "-reverse" : ""
        } w-6 xs:w-10 md:w-14 bg-background rounded-full`}
      >
        {!isTrue ? (
          <FalseImage
            className={`w-[10px] h-[10px] xs:w-4 xs:h-4 md:w-6 md:h-6  rounded-full bg-background text-text shadow-fuller shadow-gray-600 nohover:shadow-accent nohover:text-accent group-hover/toggle:shadow-accent  group-hover/toggle:text-accent`}
          />
        ) : (
          <TrueImage
            className={`w-[10px] h-[10px] xs:w-4 xs:h-4 md:w-6 md:h-6  rounded-full bg-background text-text shadow-fuller shadow-gray-600 nohover:shadow-accent nohover:text-accent group-hover/toggle:shadow-accent group-hover/toggle:text-accent `}
          />
        )}
      </div>
    </div>
  );
};

export default Toggle;
