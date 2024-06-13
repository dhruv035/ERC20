

export const getTokensBook = ()=>{
    const data = localStorage.getItem("tokensBook")
    if(data)
        return JSON.parse(data) as Array<string>;
}

export const addToken = (address: string) => {
    const tokensArray = localStorage.getItem("tokensBook");
    if (!tokensArray || tokensArray === "") {
      localStorage.setItem("tokensBook", JSON.stringify([address]));
      return [address];
    } else {
      const parsed: Array<string> = JSON.parse(tokensArray);
      parsed.push(address);
      localStorage.setItem("tokensBook", JSON.stringify(parsed));
      return parsed;
    }
  };
  
  export const removeToken = (address: string) => {
    const tokensArray = localStorage.getItem("tokensBook");
    if (!tokensArray) return;
  
    const parsed: Array<string> = JSON.parse(tokensArray);
    if (!parsed.length) {
      throw Error("Array empty");
    } else if (parsed.length === 1) {
      localStorage.removeItem("tokensBook");
      return [];
    } else {
      const indexOf = parsed.indexOf(address);
      parsed.splice(indexOf, 1);
      localStorage.setItem("tokensBook", JSON.stringify(parsed));
    }
    return parsed;
  };
  