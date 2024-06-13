export const shortenHash = (hash: string) => {
  if (!hash) return;
  const shortHash =
    hash.slice(0, 6) + "..." + hash.slice(hash.length - 7, hash.length);
  return shortHash;
};

export const countDecimals = (amount: string) => {
  const index = amount.indexOf(".");
  if (index === -1) return 0;
  return amount.length - index - 1;
};
