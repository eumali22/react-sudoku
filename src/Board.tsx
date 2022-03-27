import { useEffect, useState } from "react";
import "./Board.css";
import { Address, checkConstraints, checkWinCondition, colMap, createEmptyCollisions, fillBoard, getBoardClues, isSameAddress, isSameColumn, isSameGrid, isSameRow, rowMap } from "./engine";
import { copyBoard, createEmptyBoard } from "./engine";
import PubSub from 'pubsub-js';

export const BoardEvents = {
  FILL_GRID: "grid.fill",
  SELECT_CELL: "select.cell",
  TYPEIN_CELL: "typein.cell",
  UPDATE_BOARD: "update.board",
  CHECK_WIN: "check.win",
  VICTORY: "victory",
  NEW_GAME: "new.game"
} as const;

export function Board() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [clues, setClues] = useState(getBoardClues(board));
  const [collisions, setCollisions] = useState(createEmptyCollisions());
  const [started, setStarted] = useState(false);
  const [solved, setSolved] = useState(false);
  
  function handleKeyDown({ val, addr }: {val: number, addr: Address}) {
    const newBoard = copyBoard(board);
    newBoard[addr[0]][addr[1]] = val;
    setBoard(newBoard);

    const newCollisions = copyBoard(collisions);
    if (val === -1 || !checkConstraints(addr, val, newBoard)) {
      newCollisions[addr[0]][addr[1]] = (val !== -1);
    } else {
      newCollisions[addr[0]][addr[1]] = false;
    }
    setCollisions(newCollisions);

    if (checkWinCondition(newBoard)) {
      setSolved(true);
    }
  }

  useEffect(() => {
    if (solved) {
      PubSub.publish(BoardEvents.VICTORY);
      setTimeout(() => alert("VICTORY!"), 200);
    }
  }, [solved]);

  // Listen to board update request event
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.UPDATE_BOARD, (msg, newBoard) => {
      setBoard(newBoard);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  // Listen to new game request
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.NEW_GAME, (msg, {difficulty}) => {
      const newBoard = fillBoard(difficulty);
      const newClues = getBoardClues(newBoard);

      setSolved(false);
      setBoard(newBoard);
      setClues(newClues);
      setStarted(true);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  return (
    <div className="board">
      {board.map((val, idx) => {
        return <Grid
          key={idx}
          gridIdx={idx}
          values={val}
          handleKeyDown={handleKeyDown}
          gameStarted={started}
          gameSolved={solved}
          clues={clues[idx]}
          collisions={collisions[idx]}
        />
      })}
    </div>
  );
}

type GridProps = {
  gridIdx: number,
  values: Array<number>,
  handleKeyDown: (data: { val: number, addr: Address }) => void,
  gameStarted: boolean,
  gameSolved: boolean,
  clues: Array<boolean>,
  collisions: Array<boolean>
}

function Grid({ gridIdx, values, handleKeyDown, clues, collisions }: GridProps) {
    const comps = values.map((val, idx) => {
        return <Cell
          key={idx}
          addr={[gridIdx, idx]}
          val={val}
          handleKeyDown={handleKeyDown}
          isClue={clues[idx]}
          hasCollision={collisions[idx]}
        />
    });
    return (
        <div className={"grid "}>{comps}</div>
    );
}


const borderTop: Address[] = [...rowMap[3], ...rowMap[6]];
const borderBottom: Address[] = [...rowMap[2], ...rowMap[5]];
const borderRight: Address[] = [...colMap[2], ...colMap[5]];
const borderLeft: Address[] = [...colMap[3], ...colMap[6]];

type CellProps = {
  addr: Address,
  val: number,
  handleKeyDown: (data: { val: number, addr: Address }) => void,
  isClue: boolean,
  hasCollision: boolean
}

function Cell({addr, val, handleKeyDown, isClue, hasCollision}: CellProps) {
  const [selected, setSelected] = useState(false);
  const [highlight1, setHighlight1] = useState(false);
  const [highlight2, setHighlight2] = useState(false);

  const processKeyDown = (e: any) => {
    if (isClue) return;
    let k = parseInt(e.key);
    k = (e.keyCode === 46) ? -1 : k;
    if (val === k) return;

    if ((k >= 1 && k <= 9) || k === -1) {
      PubSub.publish(BoardEvents.TYPEIN_CELL, { val: k, addr: addr });
      handleKeyDown({ val: k, addr: addr });
    }
  }

  // highlight cell if there was an input event on a cell and it has same value as this cell
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.TYPEIN_CELL, (msg, data) => {
      setHighlight2(val !== -1 && val === data.val);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [val]);

  // highlight cell if there was a select event on a cell and it is related to this cell
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.SELECT_CELL, (msg, data) => {
      setSelected(isSameAddress(addr, data.addr));
      setHighlight1(isSameGrid(addr, data.addr) || isSameRow(addr, data.addr) || isSameColumn(addr, data.addr));
      setHighlight2(val !== -1 && val === data.val);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [selected, addr, val]);

  function computeClasses(): string {
    let suffix = hasCollision ? "-wrong" : "-correct";
    let classes = "cell";
    classes += (!isClue ? " editable" + suffix : "");
    classes += (selected && !isClue ? " sel" + suffix : "");
    classes += (highlight1 ? " hlight1" : "");
    classes += (highlight2 ? " hlight2" : "");
    classes += getBorders();
    return classes;
  }

  function getBorders() {
    let bClasses = "";
    bClasses += computeBorderClass(addr, "bdr-t", borderTop);
    bClasses += computeBorderClass(addr, "bdr-b", borderBottom);
    bClasses += computeBorderClass(addr, "bdr-r", borderRight);
    bClasses += computeBorderClass(addr, "bdr-l", borderLeft);
    return bClasses;
  }

  function computeBorderClass(addr: Address, c: string, arrAddr: Address[]): string {
    return arrAddr.reduce((pStr, cAddr) => {
      return pStr + (isSameAddress(cAddr, addr) ? (" " + c) : "");
    }, "");
  }

  return (
    <div
      tabIndex={-1}
      className={computeClasses()}
      onClick={() => {
        PubSub.publish(BoardEvents.SELECT_CELL, { addr: addr, val: val});
      }}
      onKeyDown={processKeyDown}
    >
      {val === -1 ? "" : val}
    </div>
  )
}




export default Board;
