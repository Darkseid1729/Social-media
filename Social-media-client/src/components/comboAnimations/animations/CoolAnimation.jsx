import React, { useEffect, useRef } from "react";
const RAY_COUNT  = 12;
const DONE_DELAY = 4500;
export default function CoolAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const rays = Array.from({ length: RAY_COUNT }).map((_, i) => {
      const el = document.createElement("span");
      el.className = "combo-cool-ray";
      el.style.cssText = `--ri:${i}; animation-delay:${i * 60}ms;`;
      c.appendChild(el);
      return el;
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); rays.forEach(r => r.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-cool-bg" ref={ref}>
      <span className="combo-cool-glasses">😎</span>
      <p className="combo-cool-text">Stay cool 😎</p>
    </div>
  );
}
