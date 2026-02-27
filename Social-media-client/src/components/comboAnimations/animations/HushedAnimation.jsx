import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function HushedAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-hushed-bg">
      <span className="combo-hushed-emoji">😯</span>
      <p className="combo-hushed-text">...silence... 😯</p>
    </div>
  );
}
