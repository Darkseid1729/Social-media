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
 *   💕💞💓💘💗💖💝💌 — Individual heart animations (TwoHearts, Revolving, Heartbeat, Cupid, Growing, Sparkle, Ribbon, Letter)
 *   😉😎🥲😙😗🥰😘😍😅😆😂😁😀🤗🥱😴😶‍🌫️🙄😏😣😥😮🤐😯😌😛😓😔🪵💠👌🤌🫶💅🖕🏻 — 35 individual face/gesture animations
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
import SnoozeAnimation      from "./animations/SnoozeAnimation";
import TwoHeartsAnimation   from "./animations/TwoHeartsAnimation";
import RevolvingAnimation   from "./animations/RevolvingAnimation";
import HeartbeatAnimation   from "./animations/HeartbeatAnimation";
import CupidAnimation       from "./animations/CupidAnimation";
import GrowingHeartAnimation from "./animations/GrowingHeartAnimation";
import SparkleHeartAnimation from "./animations/SparkleHeartAnimation";
import RibbonAnimation      from "./animations/RibbonAnimation";
import LoveLetterAnimation  from "./animations/LoveLetterAnimation";
import WinkAnimation        from "./animations/WinkAnimation";
import CoolAnimation        from "./animations/CoolAnimation";
import BitterSweetAnimation from "./animations/BitterSweetAnimation";
import GentleKissAnimation  from "./animations/GentleKissAnimation";
import PuckerAnimation      from "./animations/PuckerAnimation";
import SmilingHeartsAnimation from "./animations/SmilingHeartsAnimation";
import BlowKissAnimation    from "./animations/BlowKissAnimation";
import HeartEyesAnimation   from "./animations/HeartEyesAnimation";
import AwkwardAnimation     from "./animations/AwkwardAnimation";
import GigglingAnimation    from "./animations/GigglingAnimation";
import BeamingAnimation     from "./animations/BeamingAnimation";
import GrinAnimation        from "./animations/GrinAnimation";
import HugAnimation         from "./animations/HugAnimation";
import YawnAnimation        from "./animations/YawnAnimation";
import DeepSleepAnimation   from "./animations/DeepSleepAnimation";
import CloudHeadAnimation   from "./animations/CloudHeadAnimation";
import EyeRollAnimation     from "./animations/EyeRollAnimation";
import SmirkAnimation       from "./animations/SmirkAnimation";
import StrainAnimation      from "./animations/StrainAnimation";
import GloomAnimation       from "./animations/GloomAnimation";
import WowAnimation         from "./animations/WowAnimation";
import ZipAnimation         from "./animations/ZipAnimation";
import HushedAnimation      from "./animations/HushedAnimation";
import SerenityAnimation    from "./animations/SerenityAnimation";
import ColdSweatAnimation   from "./animations/ColdSweatAnimation";
import MoodDropAnimation    from "./animations/MoodDropAnimation";
import PointAtYouAnimation  from "./animations/PointAtYouAnimation";
import SkullAnimation       from "./animations/SkullAnimation";
import PoopDropAnimation    from "./animations/PoopDropAnimation";
import OkayAnimation        from "./animations/OkayAnimation";
import ChefKissAnimation    from "./animations/ChefKissAnimation";
import HeartHandsAnimation  from "./animations/HeartHandsAnimation";
import SassyAnimation       from "./animations/SassyAnimation";
import RageAnimation        from "./animations/RageAnimation";
import PeopleHugAnimation   from "./animations/PeopleHugAnimation";
import NodAnimation         from "./animations/NodAnimation";
import ShakeHeadAnimation   from "./animations/ShakeHeadAnimation";
import DarkMoonAnimation    from "./animations/DarkMoonAnimation";
// tongue (😛) re-uses CSS class inline, no separate file needed — handled below

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
  // heart variants → each has its own unique animation
  "💕": "TWOHEARTS",
  "💞": "REVOLVING",
  "💓": "HEARTBEAT",
  "💘": "CUPID",
  "💗": "GROWING",
  "💖": "SPARKLE",
  "💝": "RIBBON",
  "💌": "LETTER",
  // face / gesture emoji
  "😉": "WINK",
  "😎": "COOL",
  "🥲": "BITTERSWEET",
  "😙": "GENTLEKISS",
  "😗": "PUCKER",
  "🥰": "SMILINGHEARTS",
  "😘": "BLOWKISS",
  "😍": "HEARTEYES",
  "😅": "AWKWARD",
  "😆": "GIGGLING",
  "😂": "LAUGH",       // existing
  "😁": "BEAMING",
  "😀": "GRIN",
  "🤗": "HUG",
  "🥱": "YAWN",
  "😴": "DEEPSLEEP",
  "😶‍🌫️": "CLOUDHEAD",
  "🙄": "EYEROLL",
  "😏": "SMIRK",
  "😣": "STRAIN",
  "😥": "GLOOM",
  "😮": "WOW",
  "🤐": "ZIP",
  "😯": "HUSHED",
  "😌": "SERENITY",
  "😛": "TONGUE",
  "😓": "COLDSWEAT",
  "😔": "MOODDROP",
  "🪵": "POINTATYOU",
  "💠": "SKULL",
  "🐩": "POOP",
  "👌": "OKAY",
  "🤌": "CHEFKISS",
  "🫶": "HEARTHANDS",
  "💅": "SASSY",
  "🖕🏻": "RAGE",
  "🖕": "RAGE",
  "🫂": "PEOPLEHUG",
  "🙂‍↕️": "NOD",
  "🙂‍↔️": "SHAKEHEAD",
  "🌚": "DARKMOON",
};

// Minimum gap (ms) between two animations to prevent spam
const THROTTLE_MS = 12000;

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
      {type === "SNOOZE"    && <SnoozeAnimation      active={active}               onDone={handleDone} />}
      {type === "TWOHEARTS" && <TwoHeartsAnimation   active={active}               onDone={handleDone} />}
      {type === "REVOLVING" && <RevolvingAnimation   active={active}               onDone={handleDone} />}
      {type === "HEARTBEAT" && <HeartbeatAnimation   active={active}               onDone={handleDone} />}
      {type === "CUPID"     && <CupidAnimation       active={active}               onDone={handleDone} />}
      {type === "GROWING"   && <GrowingHeartAnimation active={active}              onDone={handleDone} />}
      {type === "SPARKLE"   && <SparkleHeartAnimation active={active}              onDone={handleDone} />}
      {type === "RIBBON"    && <RibbonAnimation      active={active}               onDone={handleDone} />}
      {type === "LETTER"       && <LoveLetterAnimation   active={active}               onDone={handleDone} />}
      {type === "WINK"         && <WinkAnimation         active={active}               onDone={handleDone} />}
      {type === "COOL"         && <CoolAnimation         active={active}               onDone={handleDone} />}
      {type === "BITTERSWEET"  && <BitterSweetAnimation  active={active}               onDone={handleDone} />}
      {type === "GENTLEKISS"   && <GentleKissAnimation   active={active}               onDone={handleDone} />}
      {type === "PUCKER"       && <PuckerAnimation       active={active}               onDone={handleDone} />}
      {type === "SMILINGHEARTS"&& <SmilingHeartsAnimation active={active}              onDone={handleDone} />}
      {type === "BLOWKISS"     && <BlowKissAnimation     active={active}               onDone={handleDone} />}
      {type === "HEARTEYES"    && <HeartEyesAnimation    active={active}               onDone={handleDone} />}
      {type === "AWKWARD"      && <AwkwardAnimation      active={active}               onDone={handleDone} />}
      {type === "GIGGLING"     && <GigglingAnimation     active={active}               onDone={handleDone} />}
      {type === "BEAMING"      && <BeamingAnimation      active={active}               onDone={handleDone} />}
      {type === "GRIN"         && <GrinAnimation         active={active}               onDone={handleDone} />}
      {type === "HUG"          && <HugAnimation          active={active}               onDone={handleDone} />}
      {type === "YAWN"         && <YawnAnimation         active={active}               onDone={handleDone} />}
      {type === "DEEPSLEEP"    && <DeepSleepAnimation    active={active}               onDone={handleDone} />}
      {type === "CLOUDHEAD"    && <CloudHeadAnimation    active={active}               onDone={handleDone} />}
      {type === "EYEROLL"      && <EyeRollAnimation      active={active}               onDone={handleDone} />}
      {type === "SMIRK"        && <SmirkAnimation        active={active}               onDone={handleDone} />}
      {type === "STRAIN"       && <StrainAnimation       active={active}               onDone={handleDone} />}
      {type === "GLOOM"        && <GloomAnimation        active={active}               onDone={handleDone} />}
      {type === "WOW"          && <WowAnimation          active={active}               onDone={handleDone} />}
      {type === "ZIP"          && <ZipAnimation          active={active}               onDone={handleDone} />}
      {type === "HUSHED"       && <HushedAnimation       active={active}               onDone={handleDone} />}
      {type === "SERENITY"     && <SerenityAnimation     active={active}               onDone={handleDone} />}
      {type === "TONGUE"       && active && (
        <div className="combo-tongue-bg">
          <span className="combo-tongue-emoji">😛</span>
          <p className="combo-tongue-text">Teehee 😛</p>
        </div>
      )}
      {type === "COLDSWEAT"    && <ColdSweatAnimation    active={active}               onDone={handleDone} />}
      {type === "MOODDROP"     && <MoodDropAnimation     active={active}               onDone={handleDone} />}
      {type === "POINTATYOU"   && <PointAtYouAnimation   active={active}               onDone={handleDone} />}
      {type === "SKULL"        && <SkullAnimation        active={active}               onDone={handleDone} />}
      {type === "POOP"         && <PoopDropAnimation     active={active}               onDone={handleDone} />}
      {type === "OKAY"         && <OkayAnimation         active={active}               onDone={handleDone} />}
      {type === "CHEFKISS"     && <ChefKissAnimation     active={active}               onDone={handleDone} />}
      {type === "HEARTHANDS"   && <HeartHandsAnimation   active={active}               onDone={handleDone} />}
      {type === "SASSY"        && <SassyAnimation        active={active}               onDone={handleDone} />}
      {type === "RAGE"         && <RageAnimation         active={active}               onDone={handleDone} />}
      {type === "PEOPLEHUG"    && <PeopleHugAnimation    active={active}               onDone={handleDone} />}
      {type === "NOD"          && <NodAnimation          active={active}               onDone={handleDone} />}
      {type === "SHAKEHEAD"    && <ShakeHeadAnimation    active={active}               onDone={handleDone} />}
      {type === "DARKMOON"     && <DarkMoonAnimation     active={active}               onDone={handleDone} />}
    </>,
    document.body
  );
}
