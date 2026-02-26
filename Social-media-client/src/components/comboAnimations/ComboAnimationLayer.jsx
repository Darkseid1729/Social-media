/**
 * ComboAnimationLayer
 * ───────────────────
 * Drop this once inside <Chat /> (or any parent).
 * It listens for the server-emitted "EMOJI_COMBO" socket event and
 * renders the correct animation based on the matched emoji.
 *
 * ✅ Does NOT interfere with the existing single-emoji EMOJI_EFFECT.
 * ✅ Zero database changes required — purely in-memory / transient.
 * ✅ Auto-cleans up after each animation.
 *
 * Supported emoji triggers:
 *   💍  — Wedding ceremony
 *   💋  — Kiss stamp + heart burst
 *   ❤️  — Heartbeat bloom + shatter
 *   👀  — Eyes peek + searchlight
 *   😂  — Laugh shake + emoji fountain
 *   🙈  — Peek-a-boo monkey paws
 *   😮‍💨 — Sigh cloud + desaturate
 *   ☀️  — Sunshine rise  (actual sun emoji)
 *   🙂  — Polite nod / passive-aggressive smile
 *   💤  — Snooze: midnight sky, drifting Z's
 */

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getSocket } from "../../socket";
import { EMOJI_COMBO } from "../../constants/events";

// Animation components (each handles its own CSS classes)
import WeddingAnimation from "./animations/WeddingAnimation";
import KissAnimation    from "./animations/KissAnimation";
import HeartAnimation   from "./animations/HeartAnimation";
import EyesAnimation    from "./animations/EyesAnimation";
import LaughAnimation   from "./animations/LaughAnimation";
import PeekAnimation    from "./animations/PeekAnimation";
import SighAnimation    from "./animations/SighAnimation";
import SunAnimation     from "./animations/SunAnimation";
import SmileAnimation   from "./animations/SmileAnimation";
import SnoozeAnimation  from "./animations/SnoozeAnimation";

// Import all animation CSS once
import "./comboAnimations.css";

// Map emoji → which animation component to render
const EMOJI_MAP = {
  "💍": "WEDDING",
  "💋": "KISS",
  "❤️": "HEART",
  "👀": "EYES",
  "😂": "LAUGH",
  "🙈": "PEEK",
  "😮‍💨": "SIGH",
  "☀️": "SUN",   // actual sun emoji
  "🙂": "SMILE", // polite / passive-aggressive smile
  "💤": "SNOOZE", // sleeping z's
};

// Minimum gap (ms) between two animations to prevent spam
const THROTTLE_MS = 6000;

export default function ComboAnimationLayer({ chatId }) {
  const socket = getSocket();

  const [effect, setEffect] = useState(null);
  // effect shape: { type: string, users: string[], active: boolean }

  const lastFiredRef = React.useRef(0);

  const handleCombo = useCallback(
    (data) => {
      // Only react to the current open chat
      if (data.chatId && chatId && data.chatId !== chatId) return;

      const type = EMOJI_MAP[data.emoji];
      if (!type) return; // unsupported emoji — ignore

      // Throttle: don't stack animations
      const now = Date.now();
      if (now - lastFiredRef.current < THROTTLE_MS) return;
      lastFiredRef.current = now;

      setEffect({ type, users: data.users || [], active: true });
    },
    [chatId]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(EMOJI_COMBO, handleCombo);
    return () => { socket.off(EMOJI_COMBO, handleCombo); };
  }, [socket, handleCombo]);

  const handleDone = useCallback(() => {
    setEffect(null);
  }, []);

  if (!effect) return null;

  const { type, users, active } = effect;

  // Render into body so it sits above everything (portal)
  return createPortal(
    <>
      {type === "WEDDING" && <WeddingAnimation active={active} users={users} onDone={handleDone} />}
      {type === "KISS"    && <KissAnimation    active={active}               onDone={handleDone} />}
      {type === "HEART"   && <HeartAnimation   active={active}               onDone={handleDone} />}
      {type === "EYES"    && <EyesAnimation    active={active}               onDone={handleDone} />}
      {type === "LAUGH"   && <LaughAnimation   active={active}               onDone={handleDone} />}
      {type === "PEEK"    && <PeekAnimation    active={active} users={users} onDone={handleDone} />}
      {type === "SIGH"    && <SighAnimation    active={active}               onDone={handleDone} />}
      {type === "SUN"     && <SunAnimation     active={active}               onDone={handleDone} />}
      {type === "SMILE"   && <SmileAnimation   active={active}               onDone={handleDone} />}
      {type === "SNOOZE"  && <SnoozeAnimation  active={active}               onDone={handleDone} />}
    </>,
    document.body
  );
}
