import React, { useEffect } from "react";
const DONE_DELAY = 5000;
export default function HeartEyesAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-hearteyes-bg">
      <div className="combo-hearteyes-glow" />
      <span className="combo-hearteyes-emoji">😍</span>
      <div className="combo-hearteyes-eyes">
        <span className="combo-hearteyes-eye">❤️</span>
        <span className="combo-hearteyes-eye">❤️</span>
      </div>
      <p className="combo-hearteyes-text">I'm obsessed 😍</p>
    </div>
  );
}
