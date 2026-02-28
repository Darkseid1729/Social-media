import React, { useEffect, useRef } from "react";
const PAW_COUNT = 10;
const DONE_DELAY = 5000;
export default function CatFaceAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const paws = Array.from({ length: PAW_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catface-paw";
      el.textContent = "🐾";
      el.style.cssText = `left:${Math.random() * 90}%; animation-delay:${i * 300}ms; font-size:${1.2 + Math.random() * 1.5}rem;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); paws.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catface-bg" ref={ref}>
      <span className="combo-catface-emoji">🐱</span>
      <p className="combo-catface-text">Meow! 🐱</p>
    </div>
  );
}
