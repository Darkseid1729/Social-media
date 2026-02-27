import React, { useEffect } from "react";
const COUNT      = 6;
const DONE_DELAY = 4000;
export default function GrinAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-grin-bg">
      {Array.from({ length: COUNT }).map((_, i) => (
        <span key={i} className="combo-grin-orbit" style={{ "--gi": i }}>😀</span>
      ))}
      <span className="combo-grin-center">😀</span>
      <p className="combo-grin-text">Pure joy! 😀</p>
    </div>
  );
}
