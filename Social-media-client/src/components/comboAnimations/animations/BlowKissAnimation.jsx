import React, { useEffect } from "react";
const DONE_DELAY = 4500;
export default function BlowKissAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-blowkiss-bg">
      <span className="combo-blowkiss-face">😘</span>
      <span className="combo-blowkiss-heart">❤️</span>
      <p className="combo-blowkiss-text">Sending love your way 😘</p>
    </div>
  );
}
