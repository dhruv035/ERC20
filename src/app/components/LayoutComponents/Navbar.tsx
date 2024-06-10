"use client";
import { formatGwei } from "viem";
import  ConnectButton  from "../Web3Components/ConnectButton";
import Toggle from "../BaseComponents/Toggle";
import { CiLight, CiDark } from "react-icons/ci";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { useChainContext } from "@/app/context/RootContext";
export default function Navbar({
  isDark,
  toggle,
}: {
  isDark: boolean;
  toggle: () => void;
}) {
  const {gasPrice} = useChainContext();
  const formatted = Number(formatGwei(gasPrice??BigInt(0))).toFixed((3));
  return (
    <div className="flex h-[8vh] md:h-[10vh] flex-row py-4 items-center bg-navbar">
      <p
        style={{ fontWeight: 900 }}
        className={`ml-6 text-xl text-white xs:text-3xl sm:text-4xl md:text-6xl whitespace-nowrap font-100 text-center font-honk`}
      >
        Send iT
      </p>
      <BsFillFuelPumpFill className="ml-2 w-[20px] sm:w-6 md:w-8  text-white"/>
      <p className="text-white text-xs text-nowrap xs:text-sm md:text-lg mx-[2px]">{formatted} Gwei</p>
      <div className="items-center w-full mr-4 flex flex-row-reverse">
        <ConnectButton/>
        <Toggle isTrue={isDark} toggle={toggle} trueImage={CiDark} falseImage={CiLight} id="LightDarkToggle"/>
      </div>
    </div>
  );
}
