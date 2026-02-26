/**
 * SnoozeAnimation — triggered when both users send 💤
 *
 * "You're both boring each other to sleep."
 *
 * - Screen dims to deep midnight navy
 * - 🌙 moon slides in from top-right corner
 * - ✨ stars twinkle into existence across the screen
 * - Giant 💤 bobs gently at center
 * - Lazy Z's of different sizes drift upward slowly
 * - Fades out after ~6 seconds
 */
import React, { useEffect, useRef } from "react";

const STAR_COUNT  = 18;
const Z_COUNT     = 10;
const DONE_DELAY  = 7000;

const Z_SIZES  = [18, 22, 28, 34, 42]; // px
const Z_DELAYS = [0.2, 0.8, 1.4, 1.9, 2.5, 3.0, 3.4, 3.8, 4.2, 4.7]; // s

export default function SnoozeAnimation({ active, onDone }) {
  const ovRef  = useRef(null);
  const bgRef  = useRef(null);
  const timers = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov = ovRef.current;
    const bg = bgRef.current;
    if (!ov || !bg) return;

    // dim to midnight
    t(() => { bg.classList.add("active"); }, 40);

    // scatter stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement("div");
      star.className   = "combo-snooze-star";
      star.textContent = "✦";
      star.style.left  = (4  + Math.random() * 92) + "%";
      star.style.top   = (4  + Math.random() * 55) + "%";
      star.style.animationDuration  = (1.2 + Math.random() * 2) + "s";
      star.style.animationDelay     = (Math.random() * 1.5)      + "s";
      star.style.opacity = "0";
      ov.appendChild(star);
    }

    // spawn lazy Z's at staggered intervals
    for (let i = 0; i < Z_COUNT; i++) {
      t(() => {
        const z = document.createElement("div");
        z.className   = "combo-snooze-z";
        z.textContent = "Z";
        const size   = Z_SIZES[Math.floor(Math.random() * Z_SIZES.length)];
        const startX = (28 + Math.random() * 44) + "%";
        const dy     = -(120 + Math.random() * 200) + "px";
        const rot1   = (Math.random() - 0.5) * 20  + "deg";
        const rot2   = (Math.random() - 0.5) * 30  + "deg";
        const dur    = (2.5 + Math.random() * 2.5)  + "s";

        z.style.cssText = `
          left: ${startX};
          bottom: 28%;
          font-size: ${size}px;
          --zy: ${dy};
          --zr: ${rot1};
          --zr2: ${rot2};
          animation-duration: ${dur};
        `;
        ov.appendChild(z);
        t(() => z.remove(), parseFloat(dur) * 1000 + 300);
      }, i * 400);
    }

    // done
    t(() => {
      bg.classList.remove("active");
      ov.querySelectorAll(".combo-snooze-star,.combo-snooze-z").forEach(el => el.remove());
      onDone?.();
    }, DONE_DELAY);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay">
      <div ref={bgRef} className="combo-snooze-bg" />
      {active && <div className="combo-snooze-moon">🌙</div>}
      {active && <div className="combo-snooze-face">💤</div>}
      {active && (
        <div className="combo-snooze-text">
          You're both boring each other to sleep… 💤
        </div>
      )}
    </div>
  );
}
