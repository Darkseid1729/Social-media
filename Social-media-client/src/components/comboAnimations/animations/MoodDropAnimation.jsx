import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function MoodDropAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const lines = [];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("span");
      el.className = "combo-mooddrop-rain";
      el.textContent = "│";
      el.style.cssText = `left:${5+i*8}vw; animation-delay:${i*150}ms; font-size:${16+Math.random()*14}px; opacity:${0.3+Math.random()*0.4};`;
      c.appendChild(el); lines.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); lines.forEach(l => l.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-mooddrop-bg" ref={ref}>
      <span className="combo-mooddrop-emoji">😔</span>
      <p className="combo-mooddrop-text">Such a mood 😔</p>
    </div>
  );
}
