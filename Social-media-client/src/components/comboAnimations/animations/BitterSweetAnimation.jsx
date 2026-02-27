import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function BitterSweetAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const items = [];
    const emojis = ["🎉","🎊","✨","💧","😂","💧","🎉","💧","✨","🎊","💧","🎉"];
    emojis.forEach((em, i) => {
      const el = document.createElement("span");
      el.className = em === "💧" ? "combo-bittersweet-tear" : "combo-bittersweet-confetti";
      el.textContent = em;
      el.style.cssText = `left:${5+i*8}vw; animation-delay:${i*140}ms; font-size:${16+Math.random()*18}px;`;
      c.appendChild(el); items.push(el);
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); items.forEach(el => el.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-bittersweet-bg" ref={ref}>
      <span className="combo-bittersweet-emoji">🥲</span>
      <p className="combo-bittersweet-text">Happy... but also crying 🥲</p>
    </div>
  );
}
