import React, { useEffect } from "react";
const RING_COUNT = 5;
const DONE_DELAY = 4500;
export default function PuckerAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-pucker-bg">
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <div key={i} className="combo-pucker-ring" style={{ "--ri": i }} />
      ))}
      <span className="combo-pucker-emoji">😗</span>
      <p className="combo-pucker-text">Smooch! 😗</p>
    </div>
  );
}
