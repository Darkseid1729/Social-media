import React, { useEffect, useRef } from "react";
const SPARK_COUNT = 8;
const DONE_DELAY = 4500;
export default function CatAngryAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const sparks = Array.from({ length: SPARK_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-catangry-spark";
      el.textContent = "💢";
      el.style.cssText = `left:${5 + Math.random() * 90}%; top:${5 + Math.random() * 90}%; animation-delay:${i * 180}ms;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); sparks.forEach(e => e.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-catangry-bg" ref={ref}>
      <span className="combo-catangry-emoji">😾</span>
      <p className="combo-catangry-text">Hisssss! 😾</p>
    </div>
  );
}
