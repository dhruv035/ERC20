//Address Book functions

import { AddressBook } from "../types";

//Update to Maintain a data structure for a contact
export const getAddressBook = () => {
    const data = localStorage.getItem("addressBook");
    if(data)
    return JSON.parse(data) as Array<AddressBook>;
    else return []
}
  

export const addAddress = (address: string,name:string) => {
    const addressArray = localStorage.getItem("addressBook");
    if (!addressArray || addressArray === "") {
      localStorage.setItem("addressBook", JSON.stringify([{address,name}]));
    } else {
      const parsed: Array<AddressBook> = JSON.parse(addressArray);
      parsed.push({address,name});
      localStorage.setItem("addressBook", JSON.stringify(parsed));
    }
  };
  
  export const removeAddress = (address: string) => {
    const addressArray = localStorage.getItem("addressBook");
    if (!addressArray) return;
  
    const parsed: Array<AddressBook> = JSON.parse(addressArray);
    parsed.splice(parsed.findIndex(item=>item.address===address), 1);
    localStorage.setItem("addressBook", JSON.stringify(parsed));
  };
  

export const unsetAddressBook = () => {
    localStorage.removeItem("addressBook");
  };

