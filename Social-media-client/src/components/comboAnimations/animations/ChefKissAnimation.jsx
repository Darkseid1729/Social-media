import React, { useEffect, useRef } from "react";
const DONE_DELAY = 4500;
export default function ChefKissAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const sparks = [];
    const emojis = ["✨","⭐","💫","✨","⭐","💫","✨","⭐"];
    emojis.forEach((em, i) => {
      const el = document.createElement("span");
      el.className = "combo-chefkiss-spark";
      el.textContent = em;
      el.style.cssText = `--cki:${i}; animation-delay:${400+i*80}ms; font-size:${14+Math.random()*18}px;`;
      c.appendChild(el); sparks.push(el);
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); sparks.forEach(s => s.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-chefkiss-bg" ref={ref}>
      <span className="combo-chefkiss-emoji">🤌</span>
      <p className="combo-chefkiss-text">Perfection! 🤌</p>
    </div>
  );
}
