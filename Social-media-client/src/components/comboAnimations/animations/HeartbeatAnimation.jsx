import React, { useEffect } from "react";

const RIPPLE_COUNT = 4;
const DONE_DELAY   = 6000;

export default function HeartbeatAnimation({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, DONE_DELAY);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-heartbeat-bg">
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
        <div key={i} className="combo-heartbeat-ripple" style={{ "--ri": i }} />
      ))}
      <span className="combo-heartbeat-heart">💓</span>
      <p className="combo-heartbeat-text">My heart beats for you 💓</p>
    </div>
  );
}
