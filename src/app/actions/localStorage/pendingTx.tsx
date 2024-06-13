
export const getPendingHash = () =>{
    return localStorage.getItem("pendingTx");
}
export const setPendingHash = (hash: string) => {
    localStorage.setItem("pendingTx", hash);
  };
  
  export const unsetPendingHash = () => {
    localStorage.removeItem("pendingTx");
  };
  
  