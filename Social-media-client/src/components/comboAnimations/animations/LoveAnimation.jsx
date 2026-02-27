import React, { useEffect, useRef } from "react";

const HEART_EMOJIS = ["💕", "💞", "💓", "💘", "💗", "💖", "💝", "💌"];
const HEART_COUNT  = 28;
const DONE_DELAY   = 5800;

export default function LoveAnimation({ active, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const hearts = [];

    for (let i = 0; i < HEART_COUNT; i++) {
      const el = document.createElement("span");
      el.className = "combo-love-heart";
      el.textContent = HEART_EMOJIS[i % HEART_EMOJIS.length];

      const size  = 16 + Math.random() * 36;         // 16–52 px
      const startX = 2 + Math.random() * 96;          // 2–98 vw
      const delay  = Math.random() * 2400;             // stagger
      const dur    = 2800 + Math.random() * 1400;      // 2.8–4.2 s
      const wobble = (Math.random() - 0.5) * 60;      // left/right drift

      el.style.cssText = `
        font-size: ${size}px;
        left: ${startX}vw;
        --wobble: ${wobble}px;
        animation-delay: ${delay}ms;
        animation-duration: ${dur}ms;
      `;

      container.appendChild(el);
      hearts.push(el);
    }

    const timer = setTimeout(onDone, DONE_DELAY);

    return () => {
      clearTimeout(timer);
      hearts.forEach((h) => h.remove());
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-love-bg" ref={containerRef}>
      <p className="combo-love-text">Love is in the air! 💕</p>
    </div>
  );
}
