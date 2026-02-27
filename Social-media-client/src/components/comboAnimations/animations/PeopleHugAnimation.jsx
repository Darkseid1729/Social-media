import React, { useEffect } from "react";

const DONE_DELAY = 5000;

export default function PeopleHugAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-peoplehug-bg">
      <div className="combo-peoplehug-scene">
        <span className="combo-peoplehug-left">🧍</span>
        <span className="combo-peoplehug-center">🫂</span>
        <span className="combo-peoplehug-right">🧍</span>
      </div>
      <div className="combo-peoplehug-warmth" />
      <p className="combo-peoplehug-text">Come here, you need this 🫂</p>
    </div>
  );
}
