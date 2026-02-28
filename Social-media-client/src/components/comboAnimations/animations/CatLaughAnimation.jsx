import React, { useEffect, useRef } from "react";
const TEAR_COUNT = 8;
const DONE_DELAY = 4500;
export default function CatLaughAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const tears = Array.from({ length: TEAR_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catlaugh-tear";
      el.textContent = "😹";
      el.style.cssText = `left:${10 + Math.random() * 80}%; animation-delay:${i * 200}ms; font-size:${1.5 + Math.random() * 1.5}rem;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); tears.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catlaugh-bg" ref={ref}>
      <span className="combo-catlaugh-emoji">😹</span>
      <p className="combo-catlaugh-text">Can't stop meow-laughing! 😹</p>
    </div>
  );
}
