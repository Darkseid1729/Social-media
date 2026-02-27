import React, { useEffect } from "react";
const DONE_DELAY = 4000;
export default function WinkAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-wink-bg">
      <div className="combo-wink-lid" />
      <span className="combo-wink-emoji">😉</span>
      <p className="combo-wink-text">The wink heard round the world 😉</p>
    </div>
  );
}
