
export const getPendingHash = () =>{
    return localStorage.getItem("pendingTx");
}
export const setPendingHash = (hash: string) => {
    localStorage.setItem("pendingTx", hash);
  };
  
  export const unsetPendingHash = () => {
    localStorage.removeItem("pendingTx");
  };
  
export const getPendingBlock = () => {
  return localStorage.getItem("pendingBlock");
};

export const setPendingBlock = (blockNumber:string) => {
  localStorage.setItem("pendingBlock",blockNumber);
}

export const unsetPendingBlock = () => {
  localStorage.removeItem("pendingBlock")
}

export const getStorageDisable = () => {
  return localStorage.getItem("localDisable")
}

export const setStorageDisable = (bool:boolean) => {
  localStorage.setItem("localDisable",bool?"true":"false")
}
export const unsetStorageDisable = () => {
  localStorage.removeItem("localDisable");
}