import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function SassyAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const sparks = [];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("span");
      el.className = "combo-sassy-sparkle";
      el.textContent = i % 2 === 0 ? "✨" : "💅";
      el.style.cssText = `left:${Math.random()*96}vw; top:${Math.random()*80}vh; font-size:${12+Math.random()*20}px; animation-delay:${Math.random()*1500}ms;`;
      c.appendChild(el); sparks.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); sparks.forEach(s => s.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-sassy-bg" ref={ref}>
      <span className="combo-sassy-emoji">💅</span>
      <p className="combo-sassy-text">Not my problem 💅</p>
    </div>
  );
}
