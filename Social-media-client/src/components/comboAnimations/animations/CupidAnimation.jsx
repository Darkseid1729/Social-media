import React, { useEffect, useRef } from "react";

const BURST_COUNT = 18;
const DONE_DELAY  = 5800;

export default function CupidAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Burst on arrow impact (~2 s in)
    const burstTimer = setTimeout(() => {
      const c = containerRef.current;
      if (!c) return;
      for (let i = 0; i < BURST_COUNT; i++) {
        const el = document.createElement("span");
        el.className = "combo-cupid-burst";
        el.textContent = "💘";
        const angle = (i / BURST_COUNT) * 360;
        const dist  = 80 + Math.random() * 120;
        const size  = 14 + Math.random() * 22;
        el.style.cssText = `
          --angle: ${angle}deg;
          --dist:  ${dist}px;
          font-size: ${size}px;
          animation-delay: ${Math.random() * 200}ms;
        `;
        c.appendChild(el);
      }
    }, 2000);

    const t = setTimeout(onDone, DONE_DELAY);
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(t);
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-cupid-bg" ref={containerRef}>
      <span className="combo-cupid-arrow">💘</span>
      <p className="combo-cupid-text">Cupid has struck! 💘</p>
    </div>
  );
}
