
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

export function copyBoard(board: Board): Board {
  return board.map((grid) => {
    return grid.map((val) => {
      return val;
    });
  });
}

export function generate(): Board {
  let arr = new Array(9).fill(new Array(9).fill(-1));
  const newBoard = putNumber(1, arr);
  return newBoard;
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

  console.log(`good to place ${n} at ${t}`);
  const newBoard = copyBoard(board);
  newBoard[t[0]][t[1]] = n;
  return newBoard;
}

export function checkGrid(t: Address, n: number, board: Board): boolean {
  const grid = board[t[0]];
  const cellIdx = t[1];

  for (let i = 0; i < 9; i++) {
    if (i !== cellIdx) {
      if (grid[i] === n) {
        return false;
      }
    }
  }
  return true;
}