import React, { useEffect } from "react";
const WAVE_COUNT = 4;
const DONE_DELAY = 5000;
export default function YawnAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-yawn-bg">
      {Array.from({ length: WAVE_COUNT }).map((_, i) => (
        <div key={i} className="combo-yawn-wave" style={{ "--wi": i }} />
      ))}
      <span className="combo-yawn-emoji">🥱</span>
      <p className="combo-yawn-text">Sooo boooring 🥱</p>
    </div>
  );
}
