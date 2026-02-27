import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function ColdSweatAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const drops = [];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement("span");
      el.className = "combo-coldsweat-drop";
      el.textContent = "💧";
      el.style.cssText = `left:${Math.random()*96}vw; font-size:${10+Math.random()*14}px; animation-delay:${Math.random()*2000}ms;`;
      c.appendChild(el); drops.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); drops.forEach(d => d.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-coldsweat-bg" ref={ref}>
      <span className="combo-coldsweat-emoji">😓</span>
      <p className="combo-coldsweat-text">Cold sweat... 😓</p>
    </div>
  );
}
