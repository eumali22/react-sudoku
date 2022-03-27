import React from 'react';
import './App.css';
import Board, { BoardEvents } from './Board';
import PubSub from 'pubsub-js';
import { Timer, TimerConstants, TimerEvents } from './Timer';

function App() {
  return (
    <div className="App">
      <Board />
      <div className='btns'>
        <Timer />
        <button onClick={() => newGame("easy")}>New Easy Game</button>
        <button onClick={() => newGame("moderate")}>New Moderate Game</button>
        <button onClick={() => newGame("hard")}>New Hard Game</button>
        <button onClick={() => pause()}>Pause Timer</button>
        <button onClick={() => checkWin()}>Check</button>
      </div>
    </div>
  );
}

function pause() {
  PubSub.publish(TimerConstants.ACTION, TimerEvents.PAUSE);
}

async function newGame(d: string) {
  PubSub.publish(BoardEvents.NEW_GAME, {difficulty: d});
  PubSub.publish(TimerConstants.ACTION, TimerEvents.END);
  PubSub.publish(TimerConstants.ACTION, TimerEvents.START);
}

function checkWin() {
  console.log("unimplemented");
  // PubSub.publish(BoardEvents.CHECK_WIN);
}

export default App;
