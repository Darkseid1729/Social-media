import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5500;
export default function CloudHeadAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const clouds = [];
    const emojis = ["☁️","🌫️","☁️","☁️","🌫️"];
    emojis.forEach((em, i) => {
      const el = document.createElement("span");
      el.className = "combo-cloudhead-cloud";
      el.textContent = em;
      el.style.cssText = `top:${15+i*14}%; font-size:${40+i*10}px; animation-delay:${i*300}ms; --dir:${i%2===0?1:-1};`;
      c.appendChild(el); clouds.push(el);
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); clouds.forEach(cl => cl.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-cloudhead-bg" ref={ref}>
      <span className="combo-cloudhead-emoji">😶‍🌫️</span>
      <p className="combo-cloudhead-text">Head in the clouds... 😶‍🌫️</p>
    </div>
  );
}
