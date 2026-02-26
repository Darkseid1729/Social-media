/**
 * HeartAnimation — triggered when both users send ❤️
 * Giant heart beats 3 times, then shatters into liquid droplets.
 */
import React, { useEffect, useRef } from "react";

const SHATTER_DELAY = 2600;
const DONE_DELAY    = 5500;

export default function HeartAnimation({ active, onDone }) {
  const ovRef    = useRef(null);
  const heartRef = useRef(null);
  const timers   = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov = ovRef.current;
    if (!ov) return;

    // subtle pink tint
    ov.style.background  = "rgba(180,0,50,0.10)";
    ov.style.transition  = "background 0.4s";

    // shatter
    t(() => {
      for (let i = 0; i < 50; i++) {
        const d   = document.createElement("div");
        d.textContent  = ["💧", "❤️", "💔", "💗"][Math.floor(Math.random() * 4)];
        d.style.cssText = `
          position:absolute; 
          left:50%; top:50%;
          font-size:${10 + Math.random() * 20}px;
          pointer-events:none;
        `;
        ov.appendChild(d);
        const x = (Math.random() - 0.5) * 340;
        const y = (Math.random() - 0.5) * 340;
        d.animate([
          { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
          { transform: `translate(${x}px,${y}px) scale(0)`, opacity: 0 },
        ], { duration: 1000 + Math.random() * 800, easing: "ease-out", fill: "forwards" });
        t(() => d.remove(), 2000);
      }
    }, SHATTER_DELAY);

    // cleanup
    t(() => { ov.style.background = ""; onDone?.(); }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay" style={{ transition: "background 0.4s" }}>
      {active && (
        <div ref={heartRef} className="combo-big-heart">❤️</div>
      )}
    </div>
  );
}
