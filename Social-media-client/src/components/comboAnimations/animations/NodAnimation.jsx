import React, { useEffect } from "react";

const DONE_DELAY = 4500;

export default function NodAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-nod-bg">
      <span className="combo-nod-emoji">🙂‍↕️</span>
      <div className="combo-nod-arrows">
        <span className="combo-nod-arrow-up">↑</span>
        <span className="combo-nod-arrow-down">↓</span>
      </div>
      <p className="combo-nod-text">Both nodding hard 🙂‍↕️</p>
    </div>
  );
}
