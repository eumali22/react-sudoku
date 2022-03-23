import React, { useEffect, useState } from "react";
import PubSub from 'pubsub-js';

const clickEvent = "CLICK_BUTTON_GROUP" as const;

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
  const { id } = props;

  useEffect(() => {
    console.log(`button ${id} subscribing`);
    const token = PubSub.subscribe(clickEvent, (msg, eventSourceId) => {
      if (id === eventSourceId) {
        console.log(`selecting ${id}`);
        setSelected(true);
      } else {
        console.log(`unselecting ${id}`);
        setSelected(false);
      }
    });
    return () => {
      console.log(`button ${id} unsubscribing`);
      PubSub.unsubscribe(token);
    }
  }, [id]); 

  return (
    <button onClick={() => PubSub.publish(clickEvent, id)}>
      {selected ? "I'm selected" : "Nah"}
    </button>
  );
}

export default ButtonGroup;