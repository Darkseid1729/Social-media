import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function ZipAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-zip-bg">
      <div className="combo-zip-line" />
      <span className="combo-zip-pull">🤐</span>
      <p className="combo-zip-text">Zip it! 🤐</p>
    </div>
  );
}
