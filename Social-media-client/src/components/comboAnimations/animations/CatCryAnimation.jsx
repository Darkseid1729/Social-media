import React, { useEffect, useRef } from "react";
const DROP_COUNT = 10;
const DONE_DELAY = 5000;
export default function CatCryAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const drops = Array.from({ length: DROP_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catcry-drop";
      el.textContent = "💧";
      el.style.cssText = `left:${10 + Math.random() * 80}%; animation-delay:${i * 250}ms; font-size:${1 + Math.random()}rem;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); drops.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catcry-bg" ref={ref}>
      <span className="combo-catcry-emoji">😿</span>
      <p className="combo-catcry-text">Sad kitty hours… 😿</p>
    </div>
  );
}
