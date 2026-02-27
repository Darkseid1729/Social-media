import React, { useEffect } from "react";
const WAVE_COUNT = 5;
const DONE_DELAY = 5500;
export default function SerenityAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-serenity-bg">
      {Array.from({ length: WAVE_COUNT }).map((_, i) => (
        <div key={i} className="combo-serenity-wave" style={{ "--sei": i }} />
      ))}
      <span className="combo-serenity-emoji">😌</span>
      <p className="combo-serenity-text">Total peace ✨</p>
    </div>
  );
}
