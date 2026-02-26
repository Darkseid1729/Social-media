/**
 * SmileAnimation — triggered when both users send 🙂
 *
 * 🙂 = "I'm happy… but not THAT happy."
 * Polite. Classy. Slightly passive-aggressive.
 *
 * - Subtle warm sepia tint (no blinding flash)
 * - A giant 🙂 materialises slowly at centre — no fanfare, no explosion
 * - Text types in one word at a time: "How..." → "...nice." → "🙂"
 * - 6 small 🙂 emojis drift sideways across the screen, unbothered
 * - Fades out quietly after 5 seconds
 */
import React, { useEffect, useRef } from "react";

const DRIFTER_COUNT = 6;
const DONE_DELAY    = 5800;

export default function SmileAnimation({ active, onDone }) {
  const ovRef  = useRef(null);
  const bgRef  = useRef(null);
  const timers = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov = ovRef.current;
    const bg = bgRef.current;
    if (!ov || !bg) return;

    // subtle sepia tint — no drama
    t(() => { bg.classList.add("active"); }, 40);

    // spawn unbothered drifters at staggered intervals
    for (let i = 0; i < DRIFTER_COUNT; i++) {
      t(() => {
        const d = document.createElement("div");
        d.className   = "combo-smile-drifter";
        d.textContent = "🙂";

        // alternate drifting left-to-right and right-to-left
        const goRight  = i % 2 === 0;
        const startX   = goRight ? "-60px" : "calc(100% + 20px)";
        const endDX    = goRight
          ? (280 + Math.random() * 180) + "px"
          : -(280 + Math.random() * 180) + "px";
        const topPos   = (15 + Math.random() * 65) + "%";
        const duration = (3.5 + Math.random() * 1.5) + "s";
        const rotate   = (Math.random() - 0.5) * 12 + "deg";

        d.style.cssText = `
          left: ${startX};
          top:  ${topPos};
          animation-duration: ${duration};
          --dx: ${endDX};
          --dr: ${rotate};
        `;

        ov.appendChild(d);
        t(() => d.remove(), parseFloat(duration) * 1000 + 200);
      }, i * 500);
    }

    // done
    t(() => {
      bg.classList.remove("active");
      ov.querySelectorAll(".combo-smile-drifter").forEach(el => el.remove());
      onDone?.();
    }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay">
      <div ref={bgRef} className="combo-smile-bg" />

      {active && <div className="combo-smile-face">🙂</div>}

      {active && (
        <div className="combo-smile-text-wrap">
          <span className="w1">How...</span>{" "}
          <span className="w2">...nice.</span>{" "}
          <span className="w3">🙂</span>
        </div>
      )}
    </div>
  );
}
