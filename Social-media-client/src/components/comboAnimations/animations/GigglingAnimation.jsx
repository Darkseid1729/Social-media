import React, { useEffect } from "react";
const DONE_DELAY = 4000;
export default function GigglingAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-giggling-bg">
      <span className="combo-giggling-emoji">😆</span>
      <p className="combo-giggling-text">Can't stop giggling 😆</p>
    </div>
  );
}
