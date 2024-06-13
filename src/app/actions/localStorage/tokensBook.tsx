export const getTokensBook = (chainId: number | undefined) => {
  if (!chainId) return [];
  const data = localStorage.getItem(`tokensBook:${chainId}`);
  if (data) return JSON.parse(data) as Array<string>;
  else return []
};

export const addToken = (chainId: number | undefined) => (address: string) => {
  if (!chainId) return;

  const tokensArray = localStorage.getItem(`tokensBook:${chainId}`);
  if (!tokensArray || tokensArray === "") {
    localStorage.setItem(`tokensBook:${chainId}`, JSON.stringify([address]));
    return [address];
  } else {
    const parsed: Array<string> = JSON.parse(tokensArray);
    parsed.push(address);
    localStorage.setItem(`tokensBook:${chainId}`, JSON.stringify(parsed));
    return parsed;
  }
};

export const removeToken =
  (chainId: number | undefined) => (address: string) => {
    if (!chainId) return;
    const tokensArray = localStorage.getItem(`tokensBook:${chainId}`);
    if (!tokensArray) return;

    
    const parsed: Array<string> = JSON.parse(tokensArray);
    if (!parsed.length) {
      throw Error("Array empty");
    } else if (parsed.length === 1) {
      localStorage.removeItem(`tokensBook:${chainId}`);
      return [];
    } else {
      const indexOf = parsed.indexOf(address);
      parsed.splice(indexOf, 1);
      localStorage.setItem(`tokensBook:${chainId}`, JSON.stringify(parsed));
    }
    return parsed;
  };

export const unsetTokenBook = (chainId: number | undefined) => {
  if (!chainId) return;
  localStorage.removeItem(`tokensBook:${chainId}`);
};
