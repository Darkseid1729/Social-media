/**
 * SunAnimation — triggered when both users send 🙂
 * Screen glows yellow, a giant sun rises from the bottom with pulsing rays.
 */
import React, { useEffect, useRef } from "react";

const RAY_COUNT  = 8;
const RAY_RADIUS = 75;
const DONE_DELAY = 5500;

export default function SunAnimation({ active, onDone }) {
  const ovRef  = useRef(null);
  const timers = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov = ovRef.current;
    if (!ov) return;

    // warm yellow glow
    ov.style.background  = "rgba(0,0,0,0)";
    ov.style.transition  = "background 0.8s";
    t(() => { ov.style.background = "rgba(255,220,50,0.12)"; }, 30);

    // spawn rays
    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2;
      const ray   = document.createElement("div");
      ray.className     = "combo-sun-ray";
      ray.textContent   = "✨";
      ray.style.left    = `calc(50% + ${Math.cos(angle) * RAY_RADIUS}px)`;
      ray.style.top     = `calc(70% + ${Math.sin(angle) * RAY_RADIUS}px)`;
      ray.style.animationDelay = (i * 0.18) + "s";
      ov.appendChild(ray);
    }

    // done
    t(() => {
      ov.style.background = "";
      ov.querySelectorAll(".combo-sun-ray").forEach(el => el.remove());
      onDone?.();
    }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay" style={{ transition: "background 0.8s" }}>
      {active && <div className="combo-sun-text">🌟 Same Vibe! What a Day! 🌟</div>}
      {active && <div className="combo-sun-face">☀️</div>}
    </div>
  );
}
