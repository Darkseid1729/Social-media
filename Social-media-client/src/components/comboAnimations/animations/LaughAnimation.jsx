/**
 * LaughAnimation — triggered when both users send 😂
 * Screen shakes, "LMAOOO" pops up, comedy emojis fountain upward.
 */
import React, { useEffect, useRef } from "react";

const PARTICLES    = 50;
const SHAKE_TARGET = "#root"; // target element to apply shake class
const DONE_DELAY   = 4500;

export default function LaughAnimation({ active, onDone }) {
  const ovRef  = useRef(null);
  const timers = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov = ovRef.current;
    if (!ov) return;

    // shake the root element briefly
    const root = document.getElementById("root") || document.body;
    root.classList.add("combo-laugh-shake");
    t(() => root.classList.remove("combo-laugh-shake"), 900);

    // spawn fountain
    for (let i = 0; i < PARTICLES; i++) {
      t(() => {
        const p   = document.createElement("div");
        p.className   = "combo-laugh-particle";
        p.textContent = ["😂", "🤣", "💀", "😭"][Math.floor(Math.random() * 4)];
        p.style.left  = (8 + Math.random() * 84) + "%";
        p.style.bottom = "0px";
        p.style.fontSize = (14 + Math.random() * 20) + "px";
        p.style.setProperty("--ly", -(180 + Math.random() * 420) + "px");
        p.style.setProperty("--lr", (Math.random() - 0.5) * 360 + "deg");
        p.style.animationDuration = (0.9 + Math.random() * 0.9) + "s";
        ov.appendChild(p);
        t(() => p.remove(), 2000);
      }, i * 70);
    }

    // done
    t(() => { ov.querySelectorAll(".combo-laugh-particle").forEach(el => el.remove()); onDone?.(); }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay">
      {active && <div className="combo-laugh-text">😂 LMAOOO 😂</div>}
    </div>
  );
}
