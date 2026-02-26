/**
 * WeddingAnimation — triggered when both users send 💍
 * Two gold rings fly in from edges, interlock, parchment scroll unrolls,
 * rose petals + gold sparkles rain.
 */
import React, { useEffect, useRef } from "react";

const RING_FLY_DELAY  = 80;   // ms before rings start flying
const SCROLL_DELAY    = 1300; // ms before scroll opens
const PETALS_START    = 1500; // ms before petals begin
const PETAL_COUNT     = 30;
const SPARKLE_COUNT   = 20;

export default function WeddingAnimation({ active, users = ["User1", "User2"], onDone }) {
  const ovRef   = useRef(null);
  const bgRef   = useRef(null);
  const ringL   = useRef(null);
  const ringR   = useRef(null);
  const scroll  = useRef(null);
  const timers  = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;

    const ov = ovRef.current;
    const bg = bgRef.current;
    if (!ov || !bg) return;

    // dim background
    t(() => { bg.classList.add("active"); }, 30);

    // fly rings inward
    t(() => {
      ringL.current?.classList.add("fly");
      ringR.current?.classList.add("fly");
    }, RING_FLY_DELAY);

    // open scroll
    t(() => { scroll.current?.classList.add("open"); }, SCROLL_DELAY);

    // spawn petals
    t(() => {
      for (let i = 0; i < PETAL_COUNT; i++) {
        t(() => spawnPetal(ov), i * 180);
      }
      for (let i = 0; i < SPARKLE_COUNT; i++) {
        t(() => spawnSparkle(ov), i * 140);
      }
    }, PETALS_START);

    // teardown
    t(() => {
      bg.classList.remove("active");
      ringL.current?.classList.remove("fly");
      ringR.current?.classList.remove("fly");
      scroll.current?.classList.remove("open");
      ov.querySelectorAll(".combo-petal,.combo-sparkle").forEach(el => el.remove());
      onDone?.();
    }, 8000);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay" style={{ pointerEvents: "none" }}>
      <div ref={bgRef} className="combo-wedding-bg" />
      <div ref={ringL} className="combo-ring left">💍</div>
      <div ref={ringR} className="combo-ring right">💍</div>
      <div ref={scroll} className="combo-scroll">
        <h2>💒 Official Chat Marriage 💒</h2>
        <p>💍 {users[0]} &amp; {users[1]} 💍</p>
        <small>"A match made in heaven!<br />You may now kiss… or keep chatting 😘"</small>
      </div>
    </div>
  );
}

function spawnPetal(parent) {
  const el = document.createElement("div");
  el.className = "combo-petal";
  el.textContent = ["🌸", "🌺", "🌹"][Math.floor(Math.random() * 3)];
  el.style.left              = Math.random() * 100 + "%";
  el.style.fontSize          = (11 + Math.random() * 13) + "px";
  el.style.animationDuration = (3 + Math.random() * 3) + "s";
  parent.appendChild(el);
  setTimeout(() => el.remove(), 7000);
}

function spawnSparkle(parent) {
  const el = document.createElement("div");
  el.className = "combo-sparkle";
  el.textContent = "✨";
  el.style.left = (20 + Math.random() * 60) + "%";
  el.style.top  = (20 + Math.random() * 50) + "%";
  el.style.setProperty("--sx", (Math.random() - 0.5) * 120 + "px");
  el.style.setProperty("--sy", (Math.random() - 0.5) * 120 + "px");
  el.style.animationDuration = (0.7 + Math.random() * 0.8) + "s";
  parent.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}
