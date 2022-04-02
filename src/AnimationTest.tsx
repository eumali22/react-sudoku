import { useEffect, useState } from "react";
import "./AnimationTest.css"

export function AnimationTest() {
  const [animation, setAnimation] = useState("");

  function changeBg() {
    if (animation === "") {
      setAnimation("pulse-start");
    }
  }

  useEffect(() => {
    let a: string;
    let ms;
    switch (animation) {
      case 'pulse-start': a = "pulse-peak"; ms = 100; break;
      case 'pulse-peak': a = "pulse-end"; ms = 200; break;
      case 'pulse-end': a = ""; ms = 400; break;
      default: a = ""; ms = 0;
    }
    if (ms !== 0) {
      setTimeout(() => {
        setAnimation(a);
      }, ms);
    }
    

  }, [animation]);

  return (
    <div className={"default-cell " + animation}>
      <p>Hello World</p>
      <button onClick={changeBg}>Pulse</button>
    </div>
  );
}