import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function TongueAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-tongue-bg">
      <span className="combo-tongue-emoji">😛</span>
      <p className="combo-tongue-text">Bleh! 😛</p>
    </div>
  );
}
