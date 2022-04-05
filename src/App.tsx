import React, { useEffect, useState } from 'react';
import './App.css';
import Board, { BoardEvents } from './Board';
import PubSub from 'pubsub-js';
import { Timer, TimerConstants, TimerEvents } from './Timer';
import Banner from './Banner';

function App() {
  const [paused, setPaused] = useState(false);
  const [pauseDisabled, setPauseDisabled] = useState(false);

  // for animation
  const [loaded, setLoaded] = useState(false);

  // run once when initial render is finished.
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 200);
  }, []);

  // listen to victory event and disable pause button
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.VICTORY, () => {
      setPauseDisabled(true);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  function togglePause() {
    PubSub.publish(TimerConstants.ACTION, paused ? TimerEvents.RESUME : TimerEvents.PAUSE);
    PubSub.publish(BoardEvents.TOGGLE_BOARD_DISPLAY);
    setPaused(!paused);
  }

  function newGame(d: string) {
    if (paused) {
      togglePause();
    }
    setPauseDisabled(false);
    PubSub.publish(BoardEvents.NEW_GAME, { difficulty: d });
    PubSub.publish(TimerConstants.ACTION, TimerEvents.END);
    PubSub.publish(TimerConstants.ACTION, TimerEvents.START);
  }

  return (
    <div className={"App" + (loaded ? "" : " App-pre") }>
      <Board />
      <div className='controls'>
        <Banner />
        <Timer />
        <button onClick={() => newGame("easy")}>New Easy Game</button>
        <button onClick={() => newGame("moderate")}>New Moderate Game</button>
        <button onClick={() => newGame("hard")}>New Hard Game</button>
        <button disabled={pauseDisabled} onClick={togglePause}>Pause/Resume Timer</button>
      </div>
    </div>
  );
}


export default App;
