import React, { useState } from 'react';
import './App.css';
import Board, { BoardEvents } from './Board';
import PubSub from 'pubsub-js';
import { Timer, TimerConstants, TimerEvents } from './Timer';

function App() {
  const [paused, setPaused] = useState(false);

  function pause() {
    PubSub.publish(TimerConstants.ACTION, paused ? TimerEvents.RESUME : TimerEvents.PAUSE);
    PubSub.publish(BoardEvents.TOGGLE_BOARD_DISPLAY);
    setPaused(!paused);
  }

  return (
    <div className="App">
      <Board />
      <div className='btns'>
        <Timer />
        <button onClick={() => newGame("easy")}>New Easy Game</button>
        <button onClick={() => newGame("moderate")}>New Moderate Game</button>
        <button onClick={() => newGame("hard")}>New Hard Game</button>
        <button onClick={pause}>Pause/Resume Timer</button>
      </div>
    </div>
  );
}

async function newGame(d: string) {
  PubSub.publish(BoardEvents.NEW_GAME, {difficulty: d});
  PubSub.publish(TimerConstants.ACTION, TimerEvents.END);
  PubSub.publish(TimerConstants.ACTION, TimerEvents.START);
}


export default App;
