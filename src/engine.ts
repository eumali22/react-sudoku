
export type Board = Array<Array<number>>;
export type Address = [number, number];
export const cellValues = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const cellIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
export const boardRows = [
  [], [], [], [], [], [], [], []
];

const rowGroups = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

const colGroups = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

export const { rowMap, colMap } = initAddressMaps();

export function initAddressMaps() {
  let xArr: Board = [];
  let yArr: Board = [];
  for (let a = 0; a < 3; a++) {
    const m = cellIndices.map((v1) => Math.floor(v1 / 3) + (3 * a));
    for (let b = 0; b < 3; b++) {
      const n = cellIndices.map((v2, i) => (i % 3) + (3 * b));
      xArr.push(m);
      yArr.push(n);
    }
  }

  let rowMap: Array<Array<Address>> = xArr.map((arr, i) => {
    return arr.map((n, j) => {
      return [n, yArr[i][j]];
    });
  });

  // pivot rowMap to get colMap
  let colMap: Array<Array<Address>> = cellIndices.map(() => new Array(9).fill(null));
  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      colMap[a][b] = [...rowMap[b][a]] as Address;
    }
  }

  // console.log(rowMap);
  // console.log(colMap);
  return {rowMap: rowMap, colMap: colMap};
}

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

export function addressIsMember(addr: Address, addrArr: Address[]) {
  for (const a of addrArr) {
    if (isSameAddress(a, addr)) return true;
  }
  return false;
}

export function isSameAddress(a: Address, b: Address) {
  return (a[0] === b[0] && a[1] === b[1]);
}

export function isSameGrid(addr1: Address, addr2: Address) {
  return (addr1[0] === addr2[0]);
}

export function isSameRow(addr1: Address, addr2: Address) {
  for (const row of rowMap) {
    if (addressIsMember(addr1, row as Address[]) &&
        addressIsMember(addr2, row as Address[])) {
      return true;
    }
  }
  return false;
}

export function isSameColumn(addr1: Address, addr2: Address) {
  for (const col of colMap) {
    if (addressIsMember(addr1, col as Address[]) &&
      addressIsMember(addr2, col as Address[])) {
      return true;
    }
  }
  return false;
}

export function createEmptyBoard(): Board {
  return cellIndices.map(() => new Array(9).fill(-1));
}

export function valAt(b: Board, addr: Address): number {
  return b[addr[0]][addr[1]];
}

export function checkWinCondition(b: Board): boolean {
  // check grids
  const validGrids = b
    .map((grid) => grid.reduce((p, c) => p + c) === 45)
    .reduce((p, c) => p && c);

  // check rows
  const validRows = rowMap
    .map((addrArr) => addrArr.map((addr) => valAt(b, addr)))
    .map((row) => row.reduce((p, c) => p + c) === 45)
    .reduce((p, c) => p && c);

  // check rows
  const validColumns = colMap
    .map((addrArr) => addrArr.map((addr) => valAt(b, addr)))
    .map((col) => col.reduce((p, c) => p + c) === 45)
    .reduce((p, c) => p && c);

  return validGrids && validRows && validColumns;
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
        // console.log("grid: not allowed...");
        return false;
      }
    }
  }
  return true;
}


export function checkRow(t: Address, n: number, board: Board): boolean {
  const rowSet0 = rowGroups.find((val) => val.includes(t[0]));
  const rowSet1 = rowGroups.find((val) => val.includes(t[1]));

  if (!rowSet0 || !rowSet1) throw(new Error("Runtime error: unexpected value."));

  for (let x = 0; x < rowSet0.length; x++) {
    for (let y = 0; y < rowSet1.length; y++) {
      if (!(t[0] === rowSet0[x] && t[1] === rowSet1[y])) {
        // console.log(`checking ${rowSet0[x]},${rowSet1[y]} against ${board[rowSet0[x]][rowSet1[y]]}`);
        if (board[rowSet0[x]][rowSet1[y]] === n) {
          // console.log("row: not allowed...");
          return false;
        }
      }
    }
  }
  return true;
}


export function checkColumn(t: Address, n: number, board: Board): boolean {
  const colSet0 = colGroups.find((val) => val.includes(t[0]));
  const colSet1 = colGroups.find((val) => val.includes(t[1]));

  if (!colSet0 || !colSet1) throw (new Error("Runtime error: unexpected value."));

  for (let x = 0; x < colSet0.length; x++) {
    for (let y = 0; y < colSet1.length; y++) {
      if (!(t[0] === colSet0[x] && t[1] === colSet1[y])) {
        // console.log(`checking ${rowSet0[x]},${rowSet1[y]} against ${board[rowSet0[x]][rowSet1[y]]}`);
        if (board[colSet0[x]][colSet1[y]] === n) {
          // console.log("column: not allowed...");
          return false;
        }
      }
    }
  }

  return true;
}

export function fillBoard(): Board {
  // type assertion to never return null.
  // assumption: brute force algo to always find a solution :)
  let b = putNumOnGrid(0, 1, createEmptyBoard()) as Board; 
  return pluckNumbers(3, b);
}

function putNumOnGrid(gIdx: number, n: number, board: Board): Board | null {
  if (n > 9) return board;
  if (board === null) return null;
  
  const idxPerm = getPermutation(cellIndices);
  // console.log(`number: ${n}, grid: ${gIdx}`);
  
  let updatedBoard = null;
  for (let currPermIdx = 0; currPermIdx < idxPerm.length; currPermIdx++) {
    const addr: Address = [gIdx, idxPerm[currPermIdx]];
    const currNum = board[addr[0]][addr[1]];
    if (currNum === -1 && checkConstraints(addr, n, board)) {
      // place value on board
      const newBoard = copyBoard(board);
      newBoard[addr[0]][addr[1]] = n;

      if (gIdx === 8) {
        updatedBoard = putNumOnGrid(0, n + 1, newBoard);
      } else {
        updatedBoard = putNumOnGrid(gIdx + 1, n, newBoard);
      }
      
      // exit for loop if valid address found
      if (updatedBoard) break;
    }
  }

  return updatedBoard;
}

export function fillGrid(gridIdx: number, board: Readonly<Board>): Board {
  const newGrid = getPermutation(cellValues);
  const newBoard = copyBoard(board);
  newBoard[gridIdx] = newGrid;
  return newBoard;
}

export function pluckNumbers(count: number, board: Readonly<Board>) {
  const b = copyBoard(board);
  for (let i = 0; i < count; i++) {
    const r1 = rand(0, 8);
    const r2 = rand(0, 8);
    b[r1][r2] = -1;
  }

  return b;
}



export async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}