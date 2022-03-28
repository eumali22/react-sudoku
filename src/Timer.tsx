import { useEffect, useState } from "react";
import PubSub from 'pubsub-js';
import './Timer.css';
import { BoardEvents } from "./Board";

export const TimerConstants = {
  step: 100,
  ACTION: "action"
} as const;

export const TimerEvents = {
  START: 'start',
  PAUSE: 'pause',
  END: 'end',
  RESUME: 'resume',
} as const;

export function Timer() {
  const [startTime, setStartTime] = useState(new Date().getTime());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);

  // listen to victory state
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.VICTORY, () => {
      PubSub.publish(TimerConstants.ACTION, TimerEvents.END);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [running]);

  // listen to new game requests
  useEffect(() => {
    const token = PubSub.subscribe(TimerConstants.ACTION, (msg, type) => {
      switch (type) {
        case TimerEvents.START:
          setElapsedMs(0);
          setStartTime(new Date().getTime());
          setRunning(true);
          break;
        case TimerEvents.PAUSE:
          setRunning(false);
          break;
        case TimerEvents.END:
          setRunning(false);
          break;
        case TimerEvents.RESUME:
          setStartTime(new Date().getTime() - elapsedMs);
          setRunning(true);
          break;
      }
    });
    
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [running, elapsedMs]);

  useEffect(() => {
    let timerId: any;
    if (running) {
      timerId = setTimeout(() => {
        setElapsedMs(new Date().getTime() - startTime);
      }, TimerConstants.step);
    }
    return () => clearTimeout(timerId);
  });

  return (
    <div className="timer">
      {convertMsToText(elapsedMs)}
    </div>
  );

}

function convertMsToText(ms: number) {
  let ms2 = Math.floor(ms % 1000 / 100);
  let s = Math.floor(ms / 1000 % 60);
  let m = Math.floor(ms / 1000 / 60);
  return (m+":").padStart(3, "0") + (s+":").padStart(3, "0") + ms2;
} 