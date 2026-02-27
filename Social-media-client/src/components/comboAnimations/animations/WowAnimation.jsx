import React, { useEffect } from "react";
const RING_COUNT = 5;
const DONE_DELAY = 4500;
export default function WowAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-wow-bg">
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <div key={i} className="combo-wow-ring" style={{ "--wri": i }} />
      ))}
      <span className="combo-wow-emoji">😮</span>
      <p className="combo-wow-text">WOAH! 😮</p>
    </div>
  );
}
