/**
 * GenericEmojiAnimation  (v2 — maximum variety)
 * ──────────────────────────────────────────────
 * A highly configurable animation component with:
 *   10 particle types · 14 entry animations · 6 continuous emoji anims
 *   6 screen effects · 3 background animations · secondary emoji · multi-emoji
 *
 * Config shape (all optional except emoji):
 *   emoji, bg, entry, text, textColor, textBg, textShadow,
 *   emojiSize, emojiShadow, emojiAnim, bgAnim,
 *   particles: { items, count, type },
 *   secondaryEmoji: { emoji, position },
 *   multiEmoji: string[],
 *   duration, screenEffect
 */
import React, { useEffect, useRef } from "react";

/* ── Particle placement functions ────────────────────────────── */
const PARTICLE_TYPES = {
  fall: (el, i) => {
    el.style.cssText = `position:absolute;top:-40px;left:${5+Math.random()*90}%;font-size:${1+Math.random()*1.5}rem;animation:genFall ${2+Math.random()}s ease-in ${i*180}ms forwards;`;
  },
  rise: (el, i) => {
    el.style.cssText = `position:absolute;bottom:-40px;left:${5+Math.random()*90}%;font-size:${1+Math.random()*1.5}rem;animation:genRise ${2+Math.random()}s ease-out ${i*180}ms forwards;`;
  },
  burst: (el, i, count) => {
    const a = (360/count)*i, d = 120+Math.random()*100;
    el.style.cssText = `position:absolute;top:50%;left:50%;font-size:${1+Math.random()*1.2}rem;animation:genBurst 1.2s ease-out ${i*60}ms forwards;--bx:${Math.cos(a*Math.PI/180)*d}px;--by:${Math.sin(a*Math.PI/180)*d}px;`;
  },
  swirl: (el, i, count) => {
    const a = (360/count)*i;
    el.style.cssText = `position:absolute;top:50%;left:50%;font-size:${1+Math.random()*1.2}rem;animation:genSwirl 2s ease-in-out ${i*120}ms forwards;--sa:${a}deg;`;
  },
  zigzag: (el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    el.style.cssText = `position:absolute;top:-40px;left:${10+Math.random()*80}%;font-size:${1+Math.random()*1.4}rem;animation:genZigzag ${2.2+Math.random()*0.8}s ease-in-out ${i*140}ms forwards;--zd:${dir};`;
  },
  spiral: (el, i, count) => {
    const a = (720/count)*i;
    el.style.cssText = `position:absolute;top:50%;left:50%;font-size:${1+Math.random()*1.2}rem;animation:genSpiral 2.5s ease-out ${i*100}ms forwards;--spa:${a}deg;`;
  },
  rain: (el, i) => {
    el.style.cssText = `position:absolute;top:-20px;left:${Math.random()*100}%;font-size:${0.8+Math.random()*0.8}rem;opacity:0;animation:genRain ${0.6+Math.random()*0.4}s linear ${i*60}ms forwards;`;
  },
  firework: (el, i, count) => {
    const a = (360/count)*i, d = 80+Math.random()*120;
    el.style.cssText = `position:absolute;top:60%;left:50%;font-size:${1+Math.random()*1.2}rem;animation:genFirework 1.8s ease-out ${i*40}ms forwards;--fx:${Math.cos(a*Math.PI/180)*d}px;--fy:${Math.sin(a*Math.PI/180)*d-100}px;`;
  },
  orbit: (el, i, count) => {
    const offset = (360/count)*i;
    el.style.cssText = `position:absolute;top:50%;left:50%;font-size:${1+Math.random()*1}rem;animation:genOrbit 2.5s linear ${i*80}ms forwards;--oa:${offset}deg;`;
  },
  scatter: (el, i) => {
    const x = (Math.random()-0.5)*500, y = (Math.random()-0.5)*500;
    el.style.cssText = `position:absolute;top:50%;left:50%;font-size:${1+Math.random()*1.5}rem;animation:genScatter 1.5s ease-out ${i*50}ms forwards;--sx:${x}px;--sy:${y}px;`;
  },
};

/* ── Entry animation strings ─────────────────────────────────── */
const ENTRY_ANIMS = {
  pop:       "genPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
  drop:      "genDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
  spin:      "genSpin 0.8s cubic-bezier(0.34,1.56,0.64,1) both",
  bounce:    "genBounce 1s ease both",
  shake:     "genPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both, genShake 0.3s ease-in-out 0.5s 5 alternate",
  tremble:   "genPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both, genTremble 0.1s ease-in-out 0.5s 12 alternate",
  flip:      "genFlip 0.8s cubic-bezier(0.34,1.56,0.64,1) both",
  pulse:     "genPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both, genPulse 0.6s ease-in-out 0.5s 3 alternate",
  elastic:   "genElastic 1.2s cubic-bezier(0.68,-0.55,0.265,1.55) both",
  swing:     "genSwing 1s ease-in-out both",
  jello:     "genPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both, genJello 0.8s ease 0.4s both",
  tada:      "genTada 1s ease both",
  wobble:    "genPop 0.4s ease both, genWobble 1s ease 0.4s 2",
  glitch:    "genGlitch 0.8s steps(6) both",
};

/* ── Screen effect style builders ────────────────────────────── */
const SCREEN_FX = {
  flash:      { animation: "genFlash 0.15s ease-in-out 0.2s 3 alternate" },
  shake:      { animation: "genScreenShake 0.3s ease-in-out 0.2s 3" },
  vignette:   { animation: "genVignette 2s ease-in-out 0.3s 2 alternate" },
  colorShift: { animation: "genColorShift 3s ease-in-out both" },
  zoom:       { animation: "genZoom 0.4s ease-in-out 0.3s 2 alternate" },
  pulse:      { animation: "genPulseScreen 0.5s ease-in-out 0.3s 3 alternate" },
};

export default function GenericEmojiAnimation({ config, active, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !config) return;
    const c = ref.current;
    const els = [];

    // Spawn particles
    if (config.particles) {
      const { items, count = 10, type = "fall" } = config.particles;
      const placeFn = PARTICLE_TYPES[type] || PARTICLE_TYPES.fall;
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.textContent = items[i % items.length];
        el.className = "gen-particle";
        placeFn(el, i, count);
        c.appendChild(el);
        els.push(el);
      }
    }

    const t = setTimeout(onDone, config.duration || 4500);
    return () => { clearTimeout(t); els.forEach(e => e.remove()); };
  }, [active, onDone, config]);

  if (!active || !config) return null;

  const entryStyle = ENTRY_ANIMS[config.entry || "pop"];
  const screenFx = config.screenEffect ? (SCREEN_FX[config.screenEffect] || {}) : {};
  const bgAnimClass = config.bgAnim ? ` gen-bg-${config.bgAnim}` : "";

  return (
    <div
      className={`gen-anim-bg${bgAnimClass}`}
      ref={ref}
      style={{ background: config.bg || "rgba(0,0,0,0.3)", ...screenFx }}
    >
      {/* Secondary emoji (orbiting / peeking / corner accent) */}
      {config.secondaryEmoji && (
        <span className={`gen-secondary gen-secondary-${config.secondaryEmoji.position || "orbit"}`}>
          {config.secondaryEmoji.emoji}
        </span>
      )}

      {/* Multi-emoji display (row of emojis instead of single) */}
      {config.multiEmoji ? (
        <div className="gen-multi-row" style={{ animation: entryStyle }}>
          {config.multiEmoji.map((e, i) => (
            <span
              key={i}
              className="gen-multi-item"
              style={{
                fontSize: config.emojiSize || "4rem",
                animationDelay: `${i * 0.15}s`,
                ...(config.emojiShadow ? { filter: `drop-shadow(0 0 12px ${config.emojiShadow})` } : {}),
              }}
            >{e}</span>
          ))}
        </div>
      ) : (
        <span
          className={`gen-anim-emoji${config.emojiAnim ? ` gen-emoji-${config.emojiAnim}` : ""}`}
          style={{
            fontSize: config.emojiSize || "5.5rem",
            animation: entryStyle,
            ...(config.emojiShadow ? { filter: `drop-shadow(0 0 16px ${config.emojiShadow})` } : {}),
          }}
        >
          {config.emoji}
        </span>
      )}

      {config.text && (
        <p
          className="gen-anim-text"
          style={{
            color: config.textColor || "#555",
            background: config.textBg || "rgba(255,255,255,0.65)",
            ...(config.textShadow ? { textShadow: `0 0 10px ${config.textShadow}` } : {}),
          }}
        >
          {config.text}
        </p>
      )}
    </div>
  );
}
