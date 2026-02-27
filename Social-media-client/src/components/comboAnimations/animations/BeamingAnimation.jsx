import React, { useEffect } from "react";
const DONE_DELAY = 4000;
export default function BeamingAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-beaming-bg">
      <div className="combo-beaming-flash" />
      <span className="combo-beaming-emoji">😁</span>
      <p className="combo-beaming-text">What a smile! 😁</p>
    </div>
  );
}
