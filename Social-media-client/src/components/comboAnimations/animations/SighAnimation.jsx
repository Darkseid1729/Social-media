/**
 * SighAnimation — triggered when both users send 😮‍💨
 * Screen desaturates, misty cloud rises, sleepy emojis float upward.
 */
import React, { useEffect, useRef } from "react";

const PARTICLES  = 20;
const DONE_DELAY = 5500;

export default function SighAnimation({ active, onDone }) {
  const ovRef   = useRef(null);
  const mistRef = useRef(null);
  const timers  = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov   = ovRef.current;
    const mist = mistRef.current;
    if (!ov || !mist) return;

    // desaturate entire overlay area via backdrop filter — just tint it
    ov.style.transition    = "filter 1s";
    ov.style.filter        = "grayscale(0.55)";
    mist.classList.add("up");

    // spawn floating bored particles
    for (let i = 0; i < PARTICLES; i++) {
      t(() => {
        const p   = document.createElement("div");
        p.className   = "combo-sigh-particle";
        p.textContent = ["💤", "😴", "🥱", "☁️"][Math.floor(Math.random() * 4)];
        p.style.left  = (10 + Math.random() * 80) + "%";
        p.style.bottom = "60px";
        p.style.fontSize = (13 + Math.random() * 14) + "px";
        p.style.animationDuration = (1.6 + Math.random() * 0.9) + "s";
        ov.appendChild(p);
        t(() => p.remove(), 2800);
      }, i * 230);
    }

    // done
    t(() => {
      mist.classList.remove("up");
      ov.style.filter = "";
      ov.querySelectorAll(".combo-sigh-particle").forEach(el => el.remove());
      onDone?.();
    }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay">
      <div ref={mistRef} className="combo-mist" />
      {active && <div className="combo-sigh-text">😮‍💨 Same energy…</div>}
    </div>
  );
}
