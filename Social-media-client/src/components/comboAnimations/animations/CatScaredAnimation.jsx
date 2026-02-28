import React, { useEffect, useRef } from "react";
const BOLT_COUNT = 6;
const DONE_DELAY = 4000;
export default function CatScaredAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const bolts = Array.from({ length: BOLT_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catscared-bolt";
      el.textContent = "⚡";
      el.style.cssText = `left:${5 + Math.random() * 90}%; top:${5 + Math.random() * 90}%; animation-delay:${i * 150}ms;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); bolts.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catscared-bg" ref={ref}>
      <span className="combo-catscared-emoji">🙀</span>
      <p className="combo-catscared-text">AHHH! 🙀</p>
    </div>
  );
}
