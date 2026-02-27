import React, { useEffect, useRef } from "react";
const DONE_DELAY = 5000;
export default function PoopDropAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const poops = [];
    for (let i = 0; i < 14; i++) {
      const el = document.createElement("span");
      el.className = "combo-poop-fall";
      el.textContent = "💩";
      el.style.cssText = `left:${2+Math.random()*96}vw; font-size:${20+Math.random()*30}px; animation-delay:${Math.random()*2200}ms; animation-duration:${1500+Math.random()*1000}ms;`;
      c.appendChild(el); poops.push(el);
    }
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); poops.forEach(p => p.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-poop-bg" ref={ref}>
      <p className="combo-poop-text">It's a crap situation 💩</p>
    </div>
  );
}
