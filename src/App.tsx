import React from 'react';
import './App.css';
import Board, { BoardEvents } from './Board';
import { fillBoard, createEmptyBoard } from './engine';
import PubSub from 'pubsub-js';

function App() {
  return (
    <div className="App">
      <Board />
      <div className='btns'>
        <button onClick={() => fillBoardAndUpdate()}>Fill Board</button>
        <button onClick={() => clearBoard()}>Clear Board</button>
        <button onClick={() => checkWin()}>Check</button>
      </div>
    </div>
  );
}

function clearBoard() {
  const b = createEmptyBoard();
  PubSub.publish(BoardEvents.UPDATE_BOARD, b);
}

function fillBoardAndUpdate() {
  const b = fillBoard();
  PubSub.publish(BoardEvents.UPDATE_BOARD, b);
}

function checkWin() {
  PubSub.publish(BoardEvents.CHECK_WIN);
}

export default App;
