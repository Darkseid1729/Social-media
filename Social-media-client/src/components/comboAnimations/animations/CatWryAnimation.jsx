import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function CatWryAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catwry-bg">
      <div className="combo-catwry-shadow" />
      <span className="combo-catwry-emoji">😼</span>
      <p className="combo-catwry-text">I know something you don't 😼</p>
    </div>
  );
}
