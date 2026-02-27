import React, { useEffect } from "react";
const DONE_DELAY = 4000;
export default function RageAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-rage-bg">
      <div className="combo-rage-flash" />
      <span className="combo-rage-emoji">🖕</span>
      <p className="combo-rage-text">Mutual feelings 🖕</p>
    </div>
  );
}
