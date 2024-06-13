"use client";
import { formatGwei } from "viem";
import ConnectButton from "../Web3Components/ConnectButton";
import Toggle from "../BaseComponents/Toggle";
import { CiLight, CiDark } from "react-icons/ci";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { useChainContext } from "@/app/context/RootContext";
import { useGasPrice } from "wagmi";
export default function Navbar({
  isDark,
  toggle,
}: {
  isDark: boolean;
  toggle: () => void;
}) {
  const { data: gasPrice } = useGasPrice({
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });
  const formatted = Number(formatGwei(gasPrice ?? BigInt(0))).toFixed(3);
  return (
    <div className="flex h-[8vh] flex-row items-center bg-navbar py-4 md:h-[10vh]">
      <p
        style={{ fontWeight: 900 }}
        className={`font-100 ml-6 whitespace-nowrap text-center font-honk text-xl text-white xs:text-3xl sm:text-4xl md:text-6xl`}
      >
        Send iT
      </p>
      <BsFillFuelPumpFill className="ml-2 w-[20px] text-white sm:w-6 md:w-8" />
      <p className="mx-[2px] text-nowrap text-xs text-white xs:text-sm md:text-lg">
        {formatted} Gwei
      </p>
      <div className="mr-4 flex w-full flex-row-reverse items-center">
        <ConnectButton />
        <Toggle
          isTrue={isDark}
          toggle={toggle}
          trueImage={<CiDark className="h-full w-full" />}
          falseImage={<CiLight className="h-full w-full" />}
          id="LightDarkToggle"
        />
      </div>
    </div>
  );
}
