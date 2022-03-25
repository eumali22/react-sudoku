import { useEffect, useRef, useState } from "react";
import "./Board.css";
import { Address, checkWinCondition, colMap, fillBoard, isSameAddress, isSameColumn, isSameGrid, isSameRow, rowMap } from "./engine";
import { copyBoard, createEmptyBoard } from "./engine";
import PubSub from 'pubsub-js';

export const BoardEvents = {
  FILL_GRID: "grid.fill",
  SELECT_CELL: "select.cell",
  TYPEIN_CELL: "typein.cell",
  UPDATE_BOARD: "update.board",
  CHECK_WIN: "check.win",
  VICTORY: "victory",
} as const;

export function Board() {
  const [board, setBoard] = useState(() => fillBoard());
  const [solved, setSolved] = useState(false);
  
  function handleKeyDown(data: { val: number, addr: Address }) {
    const newBoard = copyBoard(board);
    newBoard[data.addr[0]][data.addr[1]] = data.val;
    setBoard(newBoard);
    if (checkWinCondition(newBoard)) {
      setSolved(true);
    }
  }

  useEffect(() => {
    if (solved) setTimeout(() => alert("VICTORY!"), 200);
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

  return (
    <div className="board">
      {board.map((val, idx) => {
        return <Grid key={idx} gridIdx={idx} values={val} handleKeyDown={handleKeyDown} />
      })}
    </div>
  );
}

type GridProps = {
  gridIdx: number,
  values: Array<number>,
  handleKeyDown: (data: { val: number, addr: Address }) => void
}

function Grid(props: GridProps) {
    const { gridIdx, values } = props;
    const comps = values.map((val, idx) => {
        return <Cell
          key={idx}
          addr={[gridIdx, idx]}
          val={val}
          handleKeyDown={props.handleKeyDown}
        />
    });
    return (
        <div className={"grid " + (gridIdx % 2 === 0 ? "bg2":"bg1")}>{comps}</div>
    );
}

type CellProps = {
  addr: Address,
  val: number,
  handleKeyDown: (data: { val: number, addr: Address }) => void
}

function Cell({addr, val, handleKeyDown}: CellProps) {
  const [selected, setSelected] = useState(false);
  const [highlight1, setHighlight1] = useState(false);
  const [highlight2, setHighlight2] = useState(false);

  const processKeyDown = (e: any) => {
    let k = parseInt(e.key);
    k = (e.keyCode === 46) ? -1 : k;
    
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

  return (
    <div
      tabIndex={-1}
      className={"cell" + (selected ? " sel" : "") + (highlight1 ? " hlight1" : "") + (highlight2 ? " hlight2" : "") + getBorders(addr)}
      onClick={() => {
        PubSub.publish(BoardEvents.SELECT_CELL, { addr: addr, val: val});
      }}
      onKeyDown={processKeyDown}
    >
      {val === -1 ? "" : val}
    </div>
  )
}

const borderTop: Address[] = [...rowMap[3], ...rowMap[6]];
const borderBottom: Address[] = [...rowMap[2], ...rowMap[5]];
const borderRight: Address[] = [...colMap[2], ...colMap[5]];
const borderLeft: Address[] = [...colMap[3], ...colMap[6]];

function getBorders(addr: Address) {
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

export default Board;
