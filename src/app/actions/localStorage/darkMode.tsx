export const getDarkMode = () =>{
    return localStorage.getItem("mode");
}


export const setDarkMode = (mode:string) => {
    localStorage.setItem("mode",mode);
}

export const unsetDarkMode = () => {
    localStorage.removeItem("mode");
}