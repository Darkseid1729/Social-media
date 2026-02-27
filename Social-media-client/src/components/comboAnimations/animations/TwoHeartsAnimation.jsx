import React, { useEffect, useRef } from "react";

const TRAIL_COUNT = 20;
const DONE_DELAY  = 6000;

export default function TwoHeartsAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const c = containerRef.current;
    const trails = [];

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const el = document.createElement("span");
      el.className = "combo-twohearts-trail";
      el.textContent = "💕";
      const x  = 10 + Math.random() * 80;
      const sz = 10 + Math.random() * 20;
      el.style.cssText = `
        left: ${x}vw;
        font-size: ${sz}px;
        animation-delay: ${Math.random() * 3000}ms;
        animation-duration: ${2000 + Math.random() * 1500}ms;
      `;
      c.appendChild(el);
      trails.push(el);
    }

    const t = setTimeout(onDone, DONE_DELAY);
    return () => {
      clearTimeout(t);
      trails.forEach((el) => el.remove());
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-twohearts-bg" ref={containerRef}>
      <div className="combo-twohearts-stage">
        <span className="combo-twohearts-a">💕</span>
        <span className="combo-twohearts-b">💕</span>
      </div>
      <p className="combo-twohearts-text">Two hearts beating as one 💕</p>
    </div>
  );
}
