import React, { useEffect } from "react";
const DONE_DELAY = 5000;
export default function HeartHandsAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-hearthands-bg">
      <div className="combo-hearthands-glow" />
      <span className="combo-hearthands-emoji">🫶</span>
      <p className="combo-hearthands-text">Sending all my love 🫶</p>
    </div>
  );
}
