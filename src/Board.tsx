import { useEffect, useState } from "react";
import "./Board.css";
import { Address, Board as BoardType, checkConstraints, isSameAddress } from "./engine";
import {cellValues, copyBoard, generate, getPermutation } from "./engine";
import PubSub from 'pubsub-js';


export const BoardEvents = {
  FILL_GRID: "grid.fill",
  SELECT_CELL: "select.cell",
  TYPEIN_CELL: "typein.cell",
  UPDATE_BOARD: "update.board",
} as const;

export function Board() {
  const [board, setBoard] = useState(generate());
  
  // Listen to board update request event
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.UPDATE_BOARD, (msg, newBoard) => {
      setBoard(newBoard);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [board]);

  // Listen to fill grid event
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.FILL_GRID, (msg, data) => {
      const newBoard = fillGrid(data.gridIdx, board);
      setBoard(newBoard);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [board]); 

  // Listen to keydown events
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.TYPEIN_CELL, (msg, data) => {
      if (checkConstraints(data.addr, data.val, board)) {
        const newBoard = copyBoard(board);
        newBoard[data.addr[0]][data.addr[1]] = data.val;
        setBoard(newBoard);
      }
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [board]);

  return (
    <div className="board">
      {board.map((val, idx) => {
        return <Grid key={idx} gridIdx={idx} values={val} />
      })}
    </div>
  );
}

function Grid(props: {gridIdx: number, values: Array<number>}) {
    const { gridIdx, values } = props;
    const comps = values.map((val, idx) => {
        return <Cell
          key={idx}
          tidx={idx}
          addr={[gridIdx, idx]}
          val={val}
          selected={false}
        />
    });
    return (
        <div className={"grid " + (gridIdx % 2 === 0 ? "bg2":"bg1")}>{comps}</div>
    );
}

type CellProps = {
  addr: Address,
  val: number,
  selected: boolean,
  tidx: number,
}

function Cell(props: CellProps) {
    const [selected, setSelected] = useState(false);
    const { addr, val } = props;
    const v = val < 0 ? "-" : val;

    useEffect(() => {
      const token = PubSub.subscribe(BoardEvents.SELECT_CELL, (msg, data) => {
        if (isSameAddress(addr, data.addr)) {
          setSelected(true);
        } else {
          setSelected(false);
        }
      });
      return () => {
        PubSub.unsubscribe(token);
      }
    }, [selected, addr]);

    return (
      <div
        tabIndex={-1}
        className={"cell" + (selected? " sel": "")}
        onClick={() => {
          PubSub.publish(BoardEvents.SELECT_CELL, { addr: addr});
        }}
        onKeyDown={(e) => {
          const k = parseInt(e.key);
          if (k >= 1 && k <= 9) {
            PubSub.publish(BoardEvents.TYPEIN_CELL, {val: k, addr: addr});
          }
        }}
      >
        {v}
      </div>
    )
}

function fillGrid(gridIdx: number, board: Readonly<BoardType>): BoardType {
  const newGrid = getPermutation(cellValues);
  const newBoard = copyBoard(board);
  newBoard[gridIdx] = newGrid;
  return newBoard;
}


export default Board;
