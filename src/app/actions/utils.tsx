

export const shortenHash = (hash:string)=>{
    if(!hash)
        return;
    const shortHash = hash.slice(0,6)+"..."+hash.slice(hash.length-7,hash.length-1) 
    return shortHash;
}
