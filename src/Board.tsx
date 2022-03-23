import { useState } from "react";
import "./Board.css";
import type { Address, Board as BoardType } from "./engine";

type BoardProps = {
  solution: BoardType,
  selectedCell: Address | null,
  selectHandler: any // @Todo determine type
}

function Board(props: BoardProps) {
    // const [solution, setSolution] = generate();
    // const [guess, setGuess] = useState([]);
    
    const comps = props.solution.map((val, idx) => {
        return <Grid key={idx} gridIdx={idx} values={val} />
    });

    return (
        <div className="board">{comps}</div>
    );
}

function Grid(props: {gridIdx: number, values: Array<number>}) {
    const { gridIdx, values } = props;
    const comps = values.map((val, idx) => {
        return <Cell
          key={idx}
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
}

function Cell(props: CellProps) {
    const [sel, setSel] = useState(null);
    const {selected, val} = props;
    const v = val < 0 ? "-" : val;

    return (
      <div className={"cell" + (selected? " sel": "")}>{v}</div>
    )
}

export default Board;
