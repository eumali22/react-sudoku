import React from 'react';
import './App.css';
import Board, { BoardEvents } from './Board';
import { Board as BoardType, cellIndices, cellValues, fillBoard, generate, getPermutation, putNumOnGrid } from './engine';
import PubSub from 'pubsub-js';
import ButtonGroup from './selectHook';

function App() {
  return (
    <div className="App">
      <Board />
      <div className='btns'>
        <button onClick={printPermutation}>Print Permutation</button>
        <button onClick={() => clearBoard()}>Clear Board</button>
        <button onClick={() => fillBoardAndUpdate()}>Fill Board</button>
      </div>
    </div>
  );
}

function printPermutation() {
  console.log(getPermutation(cellValues));
}

function fillGrid(idx: number) {
  PubSub.publish(BoardEvents.FILL_GRID, {gridIdx: idx});
}

function clearBoard() {
  const b = generate();
  PubSub.publish(BoardEvents.UPDATE_BOARD, b);
}

function fillBoardAndUpdate() {
  const b = fillBoard();
  PubSub.publish(BoardEvents.UPDATE_BOARD, b);
}

export default App;
