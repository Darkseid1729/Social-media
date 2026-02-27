import React, { useEffect, useRef } from "react";

const DONE_DELAY = 6000;
const STAR_COUNT = 24;

export default function DarkMoonAnimation({ active, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const stars = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      const el = document.createElement("span");
      el.className = "combo-darkmoon-star";
      el.textContent = Math.random() > 0.5 ? "★" : "·";
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top:  ${Math.random() * 100}vh;
        font-size: ${6 + Math.random() * 14}px;
        animation-delay: ${Math.random() * 2000}ms;
      `;
      c.appendChild(el);
      stars.push(el);
    }

    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); stars.forEach(s => s.remove()); };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="combo-darkmoon-bg" ref={ref}>
      <span className="combo-darkmoon-moon">🌚</span>
      <p className="combo-darkmoon-text">Something's lurking in the dark 🌚</p>
    </div>
  );
}
