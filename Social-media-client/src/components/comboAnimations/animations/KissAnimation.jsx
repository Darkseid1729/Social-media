/**
 * KissAnimation — triggered when both users send 💋
 * Giant lip-print slams onto screen, hearts burst from it, then slides off.
 */
import React, { useEffect, useRef } from "react";

const BURST_DELAY  = 350;
const SLIDE_DELAY  = 3200;
const DONE_DELAY   = 5500;

export default function KissAnimation({ active, onDone }) {
  const ovRef    = useRef(null);
  const stampRef = useRef(null);
  const timers   = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov    = ovRef.current;
    const stamp = stampRef.current;
    if (!ov || !stamp) return;

    // slam in
    stamp.classList.remove("stamp-off");
    stamp.classList.add("stamp-in");

    // heart burst from centre
    t(() => {
      for (let i = 0; i < 50; i++) {
        const h = document.createElement("div");
        h.className   = "combo-kiss-heart";
        h.textContent = ["❤️", "💗", "💖", "💕", "💓"][Math.floor(Math.random() * 5)];
        const angle = Math.random() * Math.PI * 2;
        const dist  = 70 + Math.random() * 200;
        h.style.cssText = `
          position:absolute; 
          left:50%; top:50%;
          font-size:${14 + Math.random() * 18}px;
          --kx:${Math.cos(angle) * dist}px;
          --ky:${Math.sin(angle) * dist}px;
          animation-duration:${0.8 + Math.random() * 0.7}s;
        `;
        ov.appendChild(h);
        t(() => h.remove(), 1700);
      }
    }, BURST_DELAY);

    // slide off
    t(() => {
      stamp.classList.remove("stamp-in");
      stamp.classList.add("stamp-off");
    }, SLIDE_DELAY);

    // done
    t(() => {
      stamp.classList.remove("stamp-in", "stamp-off");
      ov.querySelectorAll(".combo-kiss-heart").forEach(el => el.remove());
      onDone?.();
    }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay">
      {active && <div className="combo-kiss-glow" />}
      {active && (
        <div className="combo-kiss-text">MWAH! 💋 Match Made in Heaven!</div>
      )}
      <div ref={stampRef} className="combo-kiss-stamp">💋</div>
    </div>
  );
}
