import React, { useEffect } from "react";

const COUNT      = 8;
const DONE_DELAY = 5500;

export default function RevolvingAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-revolving-bg">
      <div className="combo-revolving-ring">
        {Array.from({ length: COUNT }).map((_, i) => (
          <span
            key={i}
            className="combo-revolving-heart"
            style={{ "--idx": i }}
          >
            💞
          </span>
        ))}
      </div>
      <p className="combo-revolving-text">Hearts spinning just for you 💞</p>
    </div>
  );
}
