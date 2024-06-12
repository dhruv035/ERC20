"use  client";
import { NextPage } from "next";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";

//Timer was seperated out to avoid re-renders of other components in chain,

export type TimerContextType = {
  timer: number;
};

export const TimerContext = createContext<TimerContextType>(
  {} as TimerContextType,
);

const TimerProvider: NextPage<{ children: ReactNode }> = ({ children }) => {
  const [timer, setTimer] = useState(0);

  //Inv
  const blockNumber = useBlockNumber({
    watch: true,
    query: {
      staleTime: 1_000,
      refetchInterval: 1_000,
    },
  });

  //Block Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((_timeLeft) => _timeLeft - 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  useEffect(() => {
    if (!blockNumber.data) return;
    setTimer(12);
  }, [blockNumber.data]);

  return (
    <TimerContext.Provider
      value={{
        timer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerProvider;
