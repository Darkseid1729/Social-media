import React, { useEffect } from "react";
const LINE_COUNT = 8;
const DONE_DELAY = 4500;
export default function StrainAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-strain-bg">
      {Array.from({ length: LINE_COUNT }).map((_, i) => (
        <div key={i} className="combo-strain-line" style={{ "--sli": i }} />
      ))}
      <span className="combo-strain-emoji">😣</span>
      <p className="combo-strain-text">Ugh, the struggle 😣</p>
    </div>
  );
}
