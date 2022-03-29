import { useEffect, useState } from "react";
import "./Board.css";
import { Address, addressIsMember, checkComplete, checkConstraints, checkGrid, checkWinCondition, colMap, createEmptyCollisions, fillBoard, getBoardClues, getColumnAddrs, getRowAddrs, isSameAddress, isSameColumn, isSameGrid, isSameRow, rand, rowMap, valAt } from "./engine";
import { copyBoard, createEmptyBoard } from "./engine";
import PubSub from 'pubsub-js';

export const BoardEvents = {
  FILL_GRID: "grid.fill",
  SELECT_CELL: "select.cell",
  TYPEIN_CELL: "typein.cell",
  UPDATE_BOARD: "update.board",
  CHECK_WIN: "check.win",
  VICTORY: "victory",
  NEW_GAME: "new.game",
  TOGGLE_BOARD_DISPLAY: "toggle.board",
  GROUP_COMPLETED: "group.completed",
} as const;

export function Board() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [clues, setClues] = useState(getBoardClues(board));
  const [collisions, setCollisions] = useState(createEmptyCollisions());
  const [solved, setSolved] = useState(false);
  
  function handleKeyDown({ val, addr }: {val: number, addr: Address}) {
    if (solved) { return; }
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
    } else {
      if (checkComplete(newBoard[addr[0]])) {
        const gridAddrs = newBoard[addr[0]].map((v, i) => [addr[0], i]);
        PubSub.publish(BoardEvents.GROUP_COMPLETED, gridAddrs);
      }

      const rowAddrs = getRowAddrs(addr);
      const rowVals = rowAddrs.map((v) => valAt(newBoard, v));
      if (checkComplete(rowVals)) {
        PubSub.publish(BoardEvents.GROUP_COMPLETED, rowAddrs);
      }

      const colAddrs = getColumnAddrs(addr);
      const colVals = colAddrs.map((v) => valAt(newBoard, v));
      if (checkComplete(colVals)) {
        PubSub.publish(BoardEvents.GROUP_COMPLETED, colAddrs);
      }
    }
  }

  useEffect(() => {
    if (solved) {
      PubSub.publish(BoardEvents.VICTORY);
      // setTimeout(() => alert("VICTORY!"), 200);
    }
  }, [solved]);

  // Listen to board update request event
  useEffect(() => {
    console.log('listening to board update request.');
    
    const token = PubSub.subscribe(BoardEvents.UPDATE_BOARD, (msg, newBoard) => {
      setBoard(newBoard);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [board]);

  // Listen to new game request
  useEffect(() => {
    console.log('listening to new game request.');
    const token = PubSub.subscribe(BoardEvents.NEW_GAME, (msg, {difficulty}) => {
      const newBoard = fillBoard(difficulty);
      const newClues = getBoardClues(newBoard);
      const newCollisions = createEmptyCollisions();
      setSolved(false);
      setBoard(newBoard);
      setClues(newClues);
      setCollisions(newCollisions);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  return (
    <div className={"board"}>
      {board.map((val, idx) => {
        return <Grid
          key={idx}
          gridIdx={idx}
          values={val}
          handleKeyDown={handleKeyDown}
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
  const [hidden, setHidden] = useState(false);
  const [animation, setAnimation] = useState("");

  const processKeyDown = (e: any) => {
    if (isClue || hidden) return;
    let k = parseInt(e.key);
    k = (e.keyCode === 46) ? -1 : k;
    if (val === k) return;

    if ((k >= 1 && k <= 9) || k === -1) {
      PubSub.publish(BoardEvents.TYPEIN_CELL, { val: k, addr: addr });
      handleKeyDown({ val: k, addr: addr });
    }
  }

  // listen for new game. clear animation
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.NEW_GAME, () => {
      setAnimation('');
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [val, isClue, hasCollision]);

  // listen for victory. start win animation
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.VICTORY, () => {
      if (addr[1] % 4 === 0) {
        setTimeout(() => { setAnimation('victory') }, (addr[0] + addr[1]) * 50 * rand(1, 2));
      } else if (addr[1] % 4 === 1) { 
        setTimeout(() => { setAnimation('victory-alt1') }, (addr[0] + addr[1]) * 50 * rand(1, 2));
      } else if (addr[1] % 4 === 2) {
        setTimeout(() => { setAnimation('victory-alt2') }, (addr[0] + addr[1]) * 50 * rand(1, 2));
      } else if (addr[1] % 4 === 3) {
        setTimeout(() => { setAnimation('victory-alt3') }, (addr[0] + addr[1]) * 50 * rand(1, 2));
      }
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [animation]);

  // listen to group completions (row, grid, column)
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.GROUP_COMPLETED, (msg, addrs) => {
      if (addressIsMember(addr, addrs)) {
        setAnimation('pulse-start');
      }
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  // synchronize animation states
  useEffect(() => {
    let a: string;
    let ms;
    switch (animation) {
      case 'pulse-start':
        a = "pulse-peak";
        ms = 100;
        break;
      case 'pulse-peak':
        a = "pulse-end";
        ms = 200;
        break;
      case 'pulse-end':
        a = "";
        ms = 400;
        break;
      default:
        a = "";
        ms = 0;
    }

    if (ms !== 0) {
      setTimeout(() => {
        setAnimation(a);
      }, ms);
    }

  }, [animation]);

  // toggle shown / hidden contents.
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.TOGGLE_BOARD_DISPLAY, () => {
      setHidden(!hidden);
      if (!hidden) { // hide event triggered
        setSelected(false);
        setHighlight1(false);
        setHighlight2(false);
      }
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [hidden]);

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
      if (hidden) return;
      setSelected(isSameAddress(addr, data.addr));
      setHighlight1(isSameGrid(addr, data.addr) || isSameRow(addr, data.addr) || isSameColumn(addr, data.addr));
      setHighlight2(val !== -1 && val === data.val);
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  }, [selected, addr, val, hidden]);

  function computeClasses(): string {
    let suffix = hasCollision ? "-wrong" : "-correct";
    let classes = "cell" + getBorders();

    if (animation.startsWith("victory")) {
      return classes + " cell-" + animation;
    }

    classes += (!isClue ? " editable" + suffix : "");
    classes += (selected && !isClue && (animation === "") ? " sel" + suffix : "");
    classes += (highlight1 && (animation === "") ? " hlight1" : "");
    classes += (highlight2 && (animation === "") ? " hlight2" : "");
    classes += " " + animation;
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
      {val === -1 || hidden ? "" : val}
    </div>
  )
}




export default Board;
