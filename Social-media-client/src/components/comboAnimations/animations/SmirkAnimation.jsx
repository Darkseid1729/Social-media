import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function SmirkAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-smirk-bg">
      <span className="combo-smirk-emoji">😏</span>
      <p className="combo-smirk-text">Oh you thought? 😏</p>
    </div>
  );
}
