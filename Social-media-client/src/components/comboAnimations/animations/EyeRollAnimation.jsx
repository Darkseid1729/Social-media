import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function EyeRollAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-eyeroll-bg">
      <span className="combo-eyeroll-eye">🙄</span>
      <p className="combo-eyeroll-text">Okay... sure 🙄</p>
    </div>
  );
}
