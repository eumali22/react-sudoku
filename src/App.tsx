import React, { useState } from 'react';
import './App.css';
import Board from './Board';
import { Board as BoardType, generate, cellValues, getPermutation, copyBoard } from './engine';
import ButtonGroup from './selectHook';


function App() {
  const [board, setBoard] = useState(generate());
  const [selectedCell, setSelectedCell] = useState(null);


  return (
    <div className="App">
      <Board solution={board} selectedCell={null} selectHandler={setSelectedCell} />
      <div className='btns'>
        <button onClick={printPermutation}>Print Permutation</button>
        <button onClick={() => fillGrid(4, board, setBoard)}>Fill Grid with Permutation</button>
      </div>
      <ButtonGroup />
    </div>
  );

}

function printPermutation() {
  console.log(getPermutation(cellValues));
}

function fillGrid(gridIdx: number, board: BoardType, setBoard: any) {
  const newGrid = getPermutation(cellValues);
  const newBoard = copyBoard(board);
  newBoard[gridIdx] = newGrid;
  setBoard(newBoard);
}

export default App;
