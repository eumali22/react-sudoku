import { BoardEvents } from "./Board";

export type Board = Array<Array<number>>;
export type Address = [number, number];
export const cellValues = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const cellIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;


export function getPermutation(arr: Readonly<Array<number>>) {
  var loopArr = [...arr];
  var newArr = [];
  while (loopArr.length > 0) {
    let randIdx = rand(0, loopArr.length - 1);
    newArr.push(loopArr[randIdx]);
    loopArr = loopArr.filter((v, i) => i !== randIdx);
  }
  return newArr;
}

export function rand(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function copyBoard(board: Readonly<Board>): Board {
  return board.map((grid) => {
    return grid.map((val) => {
      return val;
    });
  });
}

export function isSameAddress(a: Address, b: Address): boolean {
  return (a[0] === b[0] && a[1] === b[1]);
}

export function generate(): Board {
  let arr = new Array(9).fill(new Array(9).fill(-1));
  return arr;
}

export function putNumber(n: number, board: Board): Board {
  // random place in grid 0, check against constraints. select another cell if rejected
  // place in grid 1
  // ...
  // place in grid 8

  var t = [0, rand(1, 9)];
  // if (checkGrid(t as Address, n, board)) {
  //     console.log(`good to place ${n} at ${t}`);
  // }

  while (!checkGrid(t as Address, n, board)) {
    t = [0, rand(1, 9)];
  }

  // console.log(`good to place ${n} at ${t}`);
  const newBoard = copyBoard(board);
  newBoard[t[0]][t[1]] = n;
  return newBoard;
}

export function checkConstraints(t: Address, n: number, board: Board): boolean {
  return checkGrid(t, n, board) && checkRow(t, n, board) && checkColumn(t, n, board);
}

export function checkGrid(t: Address, n: number, board: Board): boolean {
  const grid = board[t[0]];
  const cellIdx = t[1];

  for (let i = 0; i < 9; i++) {
    if (i !== cellIdx) {
      if (grid[i] === n) {
        console.log("grid: not allowed...");
        return false;
      }
    }
  }
  return true;
}

const rowGroups = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

export function checkRow(t: Address, n: number, board: Board): boolean {
  const rowSet0 = rowGroups.find((val) => val.includes(t[0]));
  const rowSet1 = rowGroups.find((val) => val.includes(t[1]));

  // console.log("rowSet0: " + rowSet0);
  // console.log("rowSet1: " + rowSet1);
  // console.log("address: " + t);
  // console.log("n: " + n);

  if (!rowSet0 || !rowSet1) throw(new Error("Runtime error: unexpected value."));

  for (let x = 0; x < rowSet0.length; x++) {
    for (let y = 0; y < rowSet1.length; y++) {
      if (!(t[0] === rowSet0[x] && t[1] === rowSet1[y])) {
        // console.log(`checking ${rowSet0[x]},${rowSet1[y]} against ${board[rowSet0[x]][rowSet1[y]]}`);
        if (board[rowSet0[x]][rowSet1[y]] === n) {
          console.log("row: not allowed...");
          return false;
        }
      }
    }
  }
  return true;
}

const colGroups = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

export function checkColumn(t: Address, n: number, board: Board): boolean {
  const colSet0 = colGroups.find((val) => val.includes(t[0]));
  const colSet1 = colGroups.find((val) => val.includes(t[1]));

  // console.log("rowSet0: " + rowSet0);
  // console.log("rowSet1: " + rowSet1);
  // console.log("address: " + t);
  // console.log("n: " + n);

  if (!colSet0 || !colSet1) throw (new Error("Runtime error: unexpected value."));

  for (let x = 0; x < colSet0.length; x++) {
    for (let y = 0; y < colSet1.length; y++) {
      if (!(t[0] === colSet0[x] && t[1] === colSet1[y])) {
        // console.log(`checking ${rowSet0[x]},${rowSet1[y]} against ${board[rowSet0[x]][rowSet1[y]]}`);
        if (board[colSet0[x]][colSet1[y]] === n) {
          console.log("column: not allowed...");
          return false;
        }
      }
    }
  }

  return true;
}

export async function fillBoard() {
  let board: Board|null = generate();
  for (let i = 1; i <= 9; i++) {
    board = await putNumOnGrid(0, i, board!);
    if (!board) {
      // need to back up to the previous number. how?
    }
  }
}

export async function putNumOnGrid(gIdx: number, n: number, board: Board): Promise<Board | null> {
  if (gIdx > 8) {
    return board;
  }

  const idxPerm = getPermutation(cellIndices);
  console.log(`perm: ${idxPerm}`);

  let updatedBoard = null;
  for (let currPermIdx = 0; currPermIdx < idxPerm.length; currPermIdx++) {
    const addr: Address = [gIdx, idxPerm[currPermIdx]];
    const currNum = board[addr[0]][addr[1]];
    // console.log(`trying to place ${n} on addr ${addr}, curr val in cell is ${currNum}`);
    if (currNum === -1 && checkConstraints(addr, n, board)) {
      console.log(`placing ${n} on good addr ${addr}...`);

      // place value on board
      const newBoard = copyBoard(board);
      newBoard[addr[0]][addr[1]] = n;
      PubSub.publish(BoardEvents.UPDATE_BOARD, newBoard);

      await wait(500);

      updatedBoard = await putNumOnGrid(gIdx + 1, n, newBoard);
      if (updatedBoard) {
        console.log(`success @ grid idx ${gIdx} addr ${addr[0]},${addr[1]}`);
        break;
      } else {
        console.log(`failed @ grid idx ${gIdx} addr ${addr[0]},${addr[1]}`);
      }
    }
  }

  await wait(200);
  return updatedBoard;
}

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}