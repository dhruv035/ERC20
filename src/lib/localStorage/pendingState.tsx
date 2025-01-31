import { PendingState } from "../types";

    
// export const getPendingHash = () => {
//   return localStorage.getItem("pendingTx");
// };
// export const setPendingHash = (hash:string) => {
//   localStorage.setItem("pendingTx",hash);
// }
// export const unsetPendingHash = () => {
//   localStorage.removeItem("pendingTx");
// }

export const getPendingStateLocal = () => {
  const data = localStorage.getItem("pendingState");
  if(data) {
    const parsedData = JSON.parse(data) as PendingState;
    return {
      ...parsedData,
      pendingTxBlock: parsedData.pendingTxBlock ? BigInt(parsedData.pendingTxBlock) : undefined,
      maxFee: parsedData.maxFee ? BigInt(parsedData.maxFee) : undefined,
      maxPriorityFee: parsedData.maxPriorityFee ? BigInt(parsedData.maxPriorityFee) : undefined
    }
  }
  else return undefined;
};
export const setPendingStateLocal = (state:PendingState) => {
  const formattedState = {
    ...state,
    pendingTxBlock: state.pendingTxBlock ? state.pendingTxBlock.toString() : undefined,
    maxFee: state.maxFee ? state.maxFee.toString() : undefined,
    maxPriorityFee: state.maxPriorityFee ? state.maxPriorityFee.toString() : undefined
  }
  localStorage.setItem("pendingState",JSON.stringify(formattedState));
}
export const unsetPendingStateLocal = () => {
  localStorage.removeItem("pendingState");
}


// export const getPendingBlock = () => {
//   return localStorage.getItem("pendingBlock");
// };

// export const setPendingBlock = (blockNumber:string) => {
//   localStorage.setItem("pendingBlock",blockNumber);
// }

// export const unsetPendingBlock = () => {
//   localStorage.removeItem("pendingBlock")
// }

export const getStorageDisable = () => {
  return localStorage.getItem("localDisable")
}

export const setStorageDisable = (bool:boolean) => {
  localStorage.setItem("localDisable",bool?"true":"false")
}
export const unsetStorageDisable = () => {
  localStorage.removeItem("localDisable");
}