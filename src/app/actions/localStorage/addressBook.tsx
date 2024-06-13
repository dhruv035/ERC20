//Address Book functions

export const getAddressBook = () => {
    const data = localStorage.getItem("tokensArray");
    if(data)
    return JSON.parse(data) as Array<string>;
}
  

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
  };
