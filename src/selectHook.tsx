import React, { useEffect, useState } from "react";
import PubSub from 'pubsub-js';

const clickEvent = "click" as const;

function ButtonGroup() {
  const btns = [1, 2, 3, 4, 5].map((v) => {
    return <Button key={v} id={v}/>
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      {btns}
    </div>
  );
}

function Button(props: {id: number}) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    console.log(`button ${props.id} subscribing`);
    const token = PubSub.subscribe(clickEvent, (msg, id) => {
      if (props.id === id) {
        console.log(`selecting ${props.id}`);
        setSelected(true);
      } else {
        console.log(`unselecting ${props.id}`);
        setSelected(false);
      }
    });
    return () => {
      console.log(`button ${props.id} unsubscribing`);
      PubSub.unsubscribe(token);
    }
  }, [selected]); 

  return (
    <button onClick={() => PubSub.publish(clickEvent, props.id)}>
      {selected ? "I'm selected" : "Nah"}
    </button>
  );
}

export default ButtonGroup;