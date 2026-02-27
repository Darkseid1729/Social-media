import React, { useEffect } from "react";
const DONE_DELAY = 5000;
export default function HugAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-hug-bg">
      <span className="combo-hug-arm combo-hug-arm-l">🤗</span>
      <span className="combo-hug-emoji">🤗</span>
      <span className="combo-hug-arm combo-hug-arm-r">🤗</span>
      <p className="combo-hug-text">Group hug!! 🤗</p>
    </div>
  );
}
