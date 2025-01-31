
import { parseGwei } from "viem";
import { GasSettings } from "./types";

export const shortenHash = (hash: string,length:number=7) => {
  if (!hash) return;
  if(length===0) return hash
  if(length>hash.length/2) return hash
  const shortHash =
    hash.slice(0, length+1) + "..." + hash.slice(hash.length - length, hash.length);
  return shortHash;
};

export const countDecimals = (amount: string) => {
  const index = amount.indexOf(".");
  if (index === -1) return 0;
  return amount.length - index - 1;
};

export const formatGasData = (gasSettings: GasSettings)=>{
  return {
     maxFeePerGas: !gasSettings.isDisabled
            ? Number(gasSettings.maxFee) > 0
              ? BigInt(parseGwei(gasSettings.maxFee))
              : BigInt(parseGwei(gasSettings.maxPriorityFee))
            : undefined,
          maxPriorityFeePerGas: !gasSettings.isDisabled
            ? BigInt(parseGwei(gasSettings.maxPriorityFee))
            : undefined,
  }
}

