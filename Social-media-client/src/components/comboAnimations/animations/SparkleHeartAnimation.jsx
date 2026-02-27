import React, { useEffect, useRef } from "react";

const PARTICLE_COUNT = 34;
const EMOJIS         = ["💖", "✨", "⭐", "💖", "✨"];
const DONE_DELAY     = 5000;

export default function SparkleHeartAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const c = containerRef.current;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const el = document.createElement("span");
      el.className = "combo-sparkle-particle";
      el.textContent = EMOJIS[i % EMOJIS.length];

      const angle = (i / PARTICLE_COUNT) * 360;
      const dist  = 70 + Math.random() * 150;
      const size  = 12 + Math.random() * 30;
      const delay = Math.random() * 350;

      el.style.cssText = `
        --angle: ${angle}deg;
        --dist:  ${dist}px;
        font-size: ${size}px;
        animation-delay: ${delay}ms;
      `;
      c.appendChild(el);
      particles.push(el);
    }

    const t = setTimeout(onDone, DONE_DELAY);
    return () => {
      clearTimeout(t);
      particles.forEach((p) => p.remove());
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-sparkle-bg" ref={containerRef}>
      <span className="combo-sparkle-center">💖</span>
      <p className="combo-sparkle-text">Sparkling with love! 💖</p>
    </div>
  );
}
