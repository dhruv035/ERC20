export const getDarkMode = () =>{
    return localStorage.getItem("mode");
}

export const setDarkMode = (mode:string) => {
    localStorage.setItem("mode",mode);
}

export const unsetDarkMode = () => {
    localStorage.removeItem("mode");
}

export const getWalletStatus = () => {
    return localStorage.getItem("isConnected")
}

export const setWalletStatus = (bool:boolean) => {
    localStorage.setItem("isConnected",bool?"true":"false");
}