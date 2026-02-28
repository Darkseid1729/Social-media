import React, { useEffect, useRef } from "react";
const HEART_COUNT = 12;
const DONE_DELAY = 5000;
export default function CatHeartAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const hearts = Array.from({ length: HEART_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catheart-float";
      el.textContent = ["💕", "💗", "💖", "❤️"][i % 4];
      el.style.cssText = `left:${5 + Math.random() * 90}%; animation-delay:${i * 180}ms; font-size:${1.2 + Math.random() * 1.8}rem;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); hearts.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catheart-bg" ref={ref}>
      <span className="combo-catheart-emoji">😻</span>
      <p className="combo-catheart-text">Purrfect love! 😻</p>
    </div>
  );
}
