import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function PointAtYouAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-pointatyou-bg">
      <span className="combo-pointatyou-finger">🫵</span>
      <p className="combo-pointatyou-text">THIS IS YOU 🫵</p>
    </div>
  );
}
