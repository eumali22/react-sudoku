import React from 'react';
import './App.css';
import Board, { BoardEvents } from './Board';
import { Board as BoardType, cellIndices, cellValues, generate, getPermutation, putNumOnGrid } from './engine';
import PubSub from 'pubsub-js';
import ButtonGroup from './selectHook';

function App() {
  return (
    <div className="App">
      <Board />
      <div className='btns'>
        <button onClick={printPermutation}>Print Permutation</button>
        <button onClick={() => fillGrid(4)}>Fill Grid with Permutation</button>
        <button onClick={() => fillBoard(1)}>Fill Board with 1</button>
        <button onClick={() => fillBoard(2)}>Fill Board with 2</button>
        <button onClick={() => fillBoard(3)}>Fill Board with 3</button>
        <button onClick={() => fillBoard(4)}>Fill Board with 4</button>
        <button onClick={() => fillBoard(5)}>Fill Board with 5</button>
        <button onClick={() => fillBoard(6)}>Fill Board with 6</button>
        <button onClick={() => fillBoard(7)}>Fill Board with 7</button>
        <button onClick={() => fillBoard(8)}>Fill Board with 8</button>
        <button onClick={() => fillBoard(9)}>Fill Board with 9</button>
      </div>
      <ButtonGroup />
    </div>
  );
}

function printPermutation() {
  console.log(getPermutation(cellValues));
}

function fillGrid(idx: number) {
  PubSub.publish(BoardEvents.FILL_GRID, {gridIdx: idx});
}

let cheatboard: BoardType | null = generate();

async function fillBoard(n: number) {
  cheatboard = await putNumOnGrid(0, n, cheatboard!);
  PubSub.publish(BoardEvents.UPDATE_BOARD, cheatboard);
  console.log("yey");
}

export default App;
