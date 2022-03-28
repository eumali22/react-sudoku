import { useEffect, useState } from "react";
import { BoardEvents } from "./Board";
import './Banner.css';

export function Banner() {
  const [bannerClass, setBannerClass] = useState("");

  // Listen to victory event
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.VICTORY, () => {
      setBannerClass("banner-victory");
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  // Listen to new game request
  useEffect(() => {
    const token = PubSub.subscribe(BoardEvents.NEW_GAME, (msg, { difficulty }) => {
      setBannerClass("");
    });
    return () => {
      PubSub.unsubscribe(token);
    }
  });

  return (
    <h1 className={bannerClass}>{bannerClass !== "" ? "Victory!" : "Sudoku!"}</h1>
  );
}

export default Banner;