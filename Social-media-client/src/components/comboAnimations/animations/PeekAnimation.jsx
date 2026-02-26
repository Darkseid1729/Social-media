/**
 * PeekAnimation — triggered when both users send 🙈
 * Monkey paws slide in from top & bottom, covering screen, then slowly peek apart.
 */
import React, { useEffect, useRef } from "react";

export default function PeekAnimation({ active, users = ["User1", "User2"], onDone }) {
  const ovRef    = useRef(null);
  const pawTopRef = useRef(null);
  const pawBotRef = useRef(null);
  const cardRef   = useRef(null);
  const timers    = useRef([]);

  const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (!active) return;
    const ov    = ovRef.current;
    const pawT  = pawTopRef.current;
    const pawB  = pawBotRef.current;
    const card  = cardRef.current;
    if (!ov || !pawT || !pawB) return;

    ov.style.background = "rgba(0,0,0,0.6)";

    // paws slide in
    t(() => { pawT.classList.add("in"); pawB.classList.add("in"); }, 50);

    // card pops up
    t(() => { card?.classList.add("in"); }, 900);

    // paws slowly peek open
    t(() => { pawT.classList.add("peek"); pawB.classList.add("peek"); }, 2000);

    // done
    t(() => {
      [pawT, pawB].forEach(el => el.classList.remove("in", "peek"));
      card?.classList.remove("in");
      ov.style.background = "";
      onDone?.();
    }, 4500);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active]);

  return (
    <div ref={ovRef} className="combo-overlay" style={{ transition: "background 0.5s" }}>
      <div ref={pawTopRef} className="combo-paw combo-paw-top">🙈</div>
      <div ref={pawBotRef} className="combo-paw combo-paw-bottom">🙈</div>
      <div ref={cardRef}   className="combo-peek-card">
        🙈 {users[0]} &amp; {users[1]} are not looking… or are they?
      </div>
    </div>
  );
}
