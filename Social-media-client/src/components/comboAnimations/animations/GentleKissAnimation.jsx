import React, { useEffect, useRef } from "react";
const DONE_DELAY = 4500;
export default function GentleKissAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const hearts = [];
    for (let i = 0; i < 14; i++) {
      const el = document.createElement("span");
      el.className = "combo-gentlekiss-heart";
      el.textContent = i % 2 === 0 ? "😙" : "💋";
      el.style.cssText = `left:${5+Math.random()*90}vw; font-size:${14+Math.random()*20}px; animation-delay:${i*200}ms;`;
      c.appendChild(el); hearts.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); hearts.forEach(h => h.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-gentlekiss-bg" ref={ref}>
      <span className="combo-gentlekiss-emoji">😙</span>
      <p className="combo-gentlekiss-text">Sweetest kiss 😙</p>
    </div>
  );
}
