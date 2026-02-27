import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function SkullAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const skulls = [];
    for (let i = 0; i < 14; i++) {
      const el = document.createElement("span");
      el.className = "combo-skull-fall";
      el.textContent = "💀";
      el.style.cssText = `left:${Math.random()*96}vw; font-size:${18+Math.random()*28}px; animation-delay:${Math.random()*2000}ms;`;
      c.appendChild(el); skulls.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); skulls.forEach(s => s.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-skull-bg" ref={ref}>
      <span className="combo-skull-center">💀</span>
      <p className="combo-skull-text">I'm dead 💀</p>
    </div>
  );
}
