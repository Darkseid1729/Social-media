import React, { useEffect, useRef } from "react";

const HEART_COUNT = 26;
const DONE_DELAY  = 5500;

export default function RibbonAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const c = containerRef.current;
    const hearts = [];

    for (let i = 0; i < HEART_COUNT; i++) {
      const el = document.createElement("span");
      el.className = "combo-ribbon-heart";
      el.textContent = "💝";

      const x     = 1  + Math.random() * 98;
      const size  = 16 + Math.random() * 34;
      const delay = Math.random() * 2200;
      const dur   = 2000 + Math.random() * 1600;
      const rot   = (Math.random() - 0.5) * 720;

      el.style.cssText = `
        left: ${x}vw;
        font-size: ${size}px;
        animation-delay: ${delay}ms;
        animation-duration: ${dur}ms;
        --rot: ${rot}deg;
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
    <div className="combo-ribbon-bg" ref={containerRef}>
      <p className="combo-ribbon-text">Wrapped with love 💝</p>
    </div>
  );
}
