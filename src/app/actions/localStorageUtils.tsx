export const addToken = (address: string) => {
  const tokensArray = localStorage.getItem("tokensBook");
  if (!tokensArray || tokensArray === "") {
    localStorage.setItem("tokensBook", JSON.stringify([address]));
  } else {
    const parsed: Array<string> = JSON.parse(tokensArray);
    parsed.push(address);
    localStorage.setItem("tokensBook", JSON.stringify(parsed));
  }
};

export const removeToken = (index: number) => {
  const tokensArray = localStorage.getItem("tokensBook");
  if (!tokensArray) return;

  const parsed: Array<string> = JSON.parse(tokensArray);
  if(!parsed.length){
    throw Error("Array empty");
  }
  else if(parsed.length===1) {
    localStorage.removeItem("tokensBook");
  }
  else{
    parsed.splice(index, 1);
  localStorage.setItem("tokensBook", JSON.stringify(parsed));}
};



export const addAddress = (address: string) => {
  const addressArray = localStorage.getItem("addressBook");
  if (!addressArray || addressArray === "") {
    localStorage.setItem("addressBook", JSON.stringify([address]));
  } else {
    const parsed: Array<string> = JSON.parse(addressArray);
    parsed.push(address);
    localStorage.setItem("addressBook", JSON.stringify(parsed));
  }
};

export const removeAddress = (index: number) => {
  const addressArray = localStorage.getItem("addressBook");
  if (!addressArray) return;

  const parsed: Array<string> = JSON.parse(addressArray);
  parsed.splice(index, 1);
  localStorage.setItem("tokensArray", JSON.stringify(parsed));
};

export const unsetAddressBook = () => {
  localStorage.removeItem("tokensArray");
}


export const setPendingHash = (hash:string) =>{
localStorage.setItem("pendingTx",hash);
}

export const unsetPendingHash = () =>{
localStorage.removeItem("pendingTx");
}