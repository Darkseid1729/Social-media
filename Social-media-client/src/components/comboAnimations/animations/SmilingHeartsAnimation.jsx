import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function SmilingHeartsAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const hearts = [];
    const emojis = ["❤️","💛","💚","💙","💜","🩷","🧡"];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement("span");
      el.className = "combo-smilinghearts-float";
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = `left:${Math.random()*100}vw; font-size:${12+Math.random()*24}px; animation-delay:${Math.random()*2500}ms; animation-duration:${2500+Math.random()*1200}ms;`;
      c.appendChild(el); hearts.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); hearts.forEach(h => h.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-smilinghearts-bg" ref={ref}>
      <span className="combo-smilinghearts-emoji">🥰</span>
      <p className="combo-smilinghearts-text">Completely smitten 🥰</p>
    </div>
  );
}
