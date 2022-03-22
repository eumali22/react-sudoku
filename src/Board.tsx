import { useState } from "react";
import "./Board.css";

type Board = Array<Array<number | null>>;
type Address = [number, number];
const numbers = [1, 2, 3, 4, 5, 6, 7, 9];

function generate(): Board {
    let arr = new Array(9).fill(new Array(9).fill(0));
    return arr;
}

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function putNumber(n: number, board: Board): Board {
    // random place in grid 0, check against constraints. select another cell if rejected
    // place in grid 1
    // ...
    // place in grid 8

    return board;
}

function checkConstraints(board: Board) {
    numbers.map((val, idx) => {

    })
}

function Board() {
    const solution = generate();
    const [guess, setGuess] = useState([]);
    
    const comps = solution.map((val, idx) => {
        return <Grid key={idx} gridIdx={idx} values={val} />
    });

    return (
        <div className="board">{comps}</div>
    );
}

function Grid(props: {gridIdx: number, values: Array<number | null>}) {
    const { gridIdx, values } = props;
    const comps = values.map((val, idx) => {
        return <Cell key={idx} addr={[gridIdx, idx]} val={val} />
    });
    return (
        <div className="grid">{comps}</div>
    );
}

function Cell(props: {addr: Address, val: number|null}) {
    return (
        <div className="cell">{props.val}</div>
    )
}

export default Board;
