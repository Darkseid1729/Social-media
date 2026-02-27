import React, { useEffect } from "react";
const DONE_DELAY = 5000;
export default function GloomAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-gloom-bg">
      <span className="combo-gloom-emoji">😥</span>
      <div className="combo-gloom-teardrop">💧</div>
      <p className="combo-gloom-text">It's okay to be a little sad 😥</p>
    </div>
  );
}
