import React, { useEffect } from "react";

const DONE_DELAY = 4500;

export default function ShakeHeadAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-shakehead-bg">
      <span className="combo-shakehead-emoji">🙂‍↔️</span>
      <div className="combo-shakehead-arrows">
        <span className="combo-shakehead-arrow-l">←</span>
        <span className="combo-shakehead-arrow-r">→</span>
      </div>
      <p className="combo-shakehead-text">Both saying no… but here 🙂‍↔️</p>
    </div>
  );
}
