

export const shortenHash = (hash:string)=>{
    if(!hash)
        return;
    const shortHash = hash.slice(0,6)+"..."+hash.slice(hash.length-7,hash.length-1) 
    return shortHash;
}


export const  countDecimals = (amount:string)=> {

    // verify if number 0.000005 is represented as "5e-6"
    // count decimals for number in representation like "0.123456"
   const index = amount.indexOf(".");
   console.log("index",index);
   if(index===-1)
    return 0;
   return amount.length-index-1;
  }