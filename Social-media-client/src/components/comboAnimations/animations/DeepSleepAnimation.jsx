import React, { useEffect, useRef } from "react";
const DONE_DELAY = 6000;
export default function DeepSleepAnimation({ active, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current;
    const zs = [];
    const sizes = [22, 28, 36, 28, 22, 32, 26];
    sizes.forEach((sz, i) => {
      const el = document.createElement("span");
      el.className = "combo-deepsleep-z";
      el.textContent = "Z";
      el.style.cssText = `font-size:${sz}px; --dzy:${-40-i*35}px; animation-delay:${700+i*500}ms;`;
      c.appendChild(el); zs.push(el);
    });
    const t = setTimeout(onDone, DONE_DELAY);
    return () => { clearTimeout(t); zs.forEach(z => z.remove()); };
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="combo-deepsleep-bg" ref={ref}>
      <span className="combo-deepsleep-face">😴</span>
      <p className="combo-deepsleep-text">Out cold 😴</p>
    </div>
  );
}
