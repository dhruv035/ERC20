"use client";
import { Honk } from "next/font/google";
import "./globals.css";
import { ContextProvider } from "./context/RootContext";
import Navbar from "./components/LayoutComponents/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";

const honk = Honk({
  subsets: ["latin-ext"],
  weight: "400",
  style: "normal",
  variable: "--font-honk",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  const darkModeLocal = useMemo(()=>{
    console.log("HI")
    if (typeof window!=="undefined")
      return localStorage.getItem("mode")
    else return;
  },[typeof window])

 useEffect(()=>{

  const handleStorage = ()=>{
    console.log("HI")
    setIsDark(localStorage.getItem("mode")==="dark"?true:false)
  }
  addEventListener("storage", ()=>{handleStorage()});
  return removeEventListener("storage",handleStorage);
 },[])
  const dmRef = useRef<string|null>();
  dmRef.current = darkModeLocal
  console.log("DARM",dmRef.current)
  useEffect(() => {
    //detect browser preferred scheme
    let media = window.matchMedia("(prefers-color-scheme: dark)");
    if (typeof window !== undefined) {
      if (localStorage.getItem("mode") === "dark") setIsDark(true);
      else if (!localStorage.getItem("mode")) {
        // this logic will be used later to create a bigger user menu, where you can set it to auto detect, not implemented but functionally works
        media.addEventListener("change", (e) => {
          if (e.matches) setIsDark(true);
          else setIsDark(false);
        });
      }
    }
    setIsMounted(true);
    return () => {
      media.removeEventListener("change", (e) => {});
    };
  }, []);

  useEffect(() => {
    darkModeLocal && setIsDark(darkModeLocal === "dark" ? true : false);
  }, [darkModeLocal]);
  return (
    <html lang="en" className={`${honk.variable} ${isDark ? "dark" : ""}`}>
      <head>
        <title>Send IT</title>
      </head>
      <meta name="description" content="Send ERC 20 Tokens" />
      <body>
        {isMounted && (
          <ContextProvider isDark={isDark}>
            <Navbar
              isDark={isDark}
              toggle={() => {
                setIsDark((prevState) => {
                  if (typeof window !== "undefined") {
                    if (prevState) localStorage.setItem("mode", "light");
                    else localStorage.setItem("mode", "dark");
                  }
                  return !prevState;
                });
              }}
            />
            {children}
          </ContextProvider>
        )}
      </body>
    </html>
  );
}