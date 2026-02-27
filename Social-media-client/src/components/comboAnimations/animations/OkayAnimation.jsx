import React, { useEffect } from "react";
const DONE_DELAY = 4000;
export default function OkayAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-okay-bg">
      <span className="combo-okay-check">✅</span>
      <span className="combo-okay-emoji">👌</span>
      <p className="combo-okay-text">Perfectly okay 👌</p>
    </div>
  );
}
