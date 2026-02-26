/**
 * EyesAnimation — triggered when both users send 👀
 * Screen goes dark, eye pairs peek from random corners, searchlight sweeps.
 */
import React, { useEffect, useRef } from "react";

const EYE_POSITIONS = [
  { left: "6%",  top: "16%" }, { right: "6%",  top: "22%" },
  { left: "14%", top: "58%" }, { right: "10%", top: "52%" },
  { left: "42%", top: "8%"  }, { left: "52%",  top: "72%" },
  { left: "22%", top: "38%" }, { right: "18%", top: "42%" },
];
const DONE_DELAY = 4500;

export default function EyesAnimation({ active, onDone }) {
  const ovRef = useRef(null);
  const bgRef = useRef(null);
  const timers = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov = ovRef.current;
    const bg = bgRef.current;
    if (!ov || !bg) return;

    t(() => { bg.classList.add("active"); }, 30);

    EYE_POSITIONS.forEach((pos, i) => {
      t(() => {
        const el = document.createElement("div");
        el.className   = "combo-eye-pair";
        el.textContent = "👀";
        Object.assign(el.style, pos);
        ov.appendChild(el);
        t(() => el.remove(), 4200);
      }, i * 200);
    });

    // done
    t(() => {
      bg.classList.remove("active");
      ov.querySelectorAll(".combo-eye-pair").forEach(el => el.remove());
      onDone?.();
    }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay">
      <div ref={bgRef} className="combo-eyes-bg" />
      {active && <div className="combo-searchlight" />}
      {active && <div className="combo-eyes-text">W E &nbsp; S E E &nbsp; Y O U . . .</div>}
    </div>
  );
}
