import React, { useEffect, useRef } from "react";

const HEART_COUNT = 18;
const DONE_DELAY  = 6200;

export default function LoveLetterAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Hearts fly out after envelope "opens" at ~1.2 s
    const heartTimer = setTimeout(() => {
      const c = containerRef.current;
      if (!c) return;

      for (let i = 0; i < HEART_COUNT; i++) {
        const el = document.createElement("span");
        el.className = "combo-letter-heart";
        el.textContent = i % 3 === 0 ? "💌" : "💕";

        const lx    = (Math.random() - 0.5) * 70; // vw spread
        const size  = 14 + Math.random() * 22;
        const delay = i * 90;

        el.style.cssText = `
          --lx: ${lx}vw;
          font-size: ${size}px;
          animation-delay: ${delay}ms;
        `;
        c.appendChild(el);
      }
    }, 1200);

    const t = setTimeout(onDone, DONE_DELAY);
    return () => {
      clearTimeout(heartTimer);
      clearTimeout(t);
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-letter-bg" ref={containerRef}>
      <div className="combo-letter-envelope">
        <span className="combo-letter-emoji">💌</span>
      </div>
      <p className="combo-letter-text">You&#39;ve got love mail! 💌</p>
    </div>
  );
}
