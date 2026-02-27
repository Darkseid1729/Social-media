import React, { useEffect, useRef } from "react";

const HEART_COUNT = 22;
const DONE_DELAY  = 5500;

export default function GrowingHeartAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const c = containerRef.current;
    const hearts = [];

    for (let i = 0; i < HEART_COUNT; i++) {
      const el = document.createElement("span");
      el.className = "combo-growing-heart";
      el.textContent = "💗";

      // Hearts get progressively bigger over the spawn sequence
      const size  = 12 + i * 2.2;
      const x     = 5  + Math.random() * 90;
      const delay = i * 120;
      const dur   = 2200 + Math.random() * 1000;

      el.style.cssText = `
        left: ${x}vw;
        font-size: ${size}px;
        animation-delay: ${delay}ms;
        animation-duration: ${dur}ms;
      `;
      c.appendChild(el);
      hearts.push(el);
    }

    const t = setTimeout(onDone, DONE_DELAY);
    return () => {
      clearTimeout(t);
      hearts.forEach((h) => h.remove());
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-growing-bg" ref={containerRef}>
      <p className="combo-growing-text">Love that keeps growing 💗</p>
    </div>
  );
}
