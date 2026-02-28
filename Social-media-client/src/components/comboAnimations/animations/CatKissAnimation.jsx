import React, { useEffect, useRef } from "react";
const KISS_COUNT = 8;
const DONE_DELAY = 4500;
export default function CatKissAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const kisses = Array.from({ length: KISS_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catkiss-mark";
      el.textContent = "💋";
      el.style.cssText = `left:${10 + Math.random() * 80}%; top:${10 + Math.random() * 80}%; animation-delay:${i * 250}ms; font-size:${1 + Math.random() * 1.5}rem;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); kisses.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catkiss-bg" ref={ref}>
      <span className="combo-catkiss-emoji">😽</span>
      <p className="combo-catkiss-text">Kitty kisses! 😽</p>
    </div>
  );
}
