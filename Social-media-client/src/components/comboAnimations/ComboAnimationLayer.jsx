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

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { getSocket } from "../../socket";
import { EMOJI_COMBO, EMOJI_ANIMATION } from "../../constants/events";

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
import CatLaughAnimation    from "./animations/CatLaughAnimation";
import CatHeartAnimation    from "./animations/CatHeartAnimation";
import CatWryAnimation      from "./animations/CatWryAnimation";
import CatKissAnimation     from "./animations/CatKissAnimation";
import CatScaredAnimation   from "./animations/CatScaredAnimation";
import CatCryAnimation      from "./animations/CatCryAnimation";
import CatAngryAnimation    from "./animations/CatAngryAnimation";
import CatFaceAnimation     from "./animations/CatFaceAnimation";
import GenericEmojiAnimation from "./animations/GenericEmojiAnimation";
// tongue (😛) re-uses CSS class inline, no separate file needed — handled below

// Import all animation CSS once
import "./comboAnimations.css";
import GENERIC_EMOJI_CONFIGS from "./allEmojiAnimationConfigs";

// Map emoji → which animation component to render
export const EMOJI_MAP = {
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
  // cat emoji
  "😹": "CATLAUGH",
  "😻": "CATHEART",
  "😼": "CATWRY",
  "😽": "CATKISS",
  "🙀": "CATSCARED",
  "😿": "CATCRY",
  "😾": "CATANGRY",
  "🐱": "CATFACE",
  // ─── Generic emoji animations (template-driven) ───
  // Smileys
  "😃": "HAPPY",
  "😄": "BIGGRIN",
  "🤣": "ROFL",
  "😊": "BLUSH",
  "😋": "YUMMY",
  "🤩": "STARSTRUCK",
  "🤔": "THINKING",
  "🤨": "RAISEBROW",
  "😐": "NEUTRAL",
  "😑": "EXPRESSIONLESS",
  "😶": "MUTE",
  "😪": "SLEEPY",
  "😫": "TIRED",
  "😜": "WINKTONGUE",
  "😝": "SQUINTTONGUE",
  "🤤": "DROOL",
  "😒": "UNAMUSED",
  "😕": "CONFUSED",
  "🙃": "UPSIDEDOWN",
  "🤑": "MONEY",
  "😲": "ASTONISHED",
  "🙁": "SLIGHTSAD",
  "☹️": "FROWN",
  "😖": "CONFOUNDED",
  "😞": "DISAPPOINTED",
  "😟": "WORRIED",
  "😤": "HUFFING",
  "😢": "CRY",
  "😭": "SOBBING",
  "😦": "FROWNOPEN",
  "😧": "ANGUISHED",
  "😨": "FEARFUL",
  "😩": "WEARY",
  "🤯": "EXPLODE",
  "😬": "GRIMACE",
  "😰": "ANXIOUS",
  "😱": "SCREAM",
  "🥵": "HOTFACE",
  "🥶": "COLDFACE",
  "😳": "FLUSHED",
  "🤪": "ZANY",
  "😵": "DIZZY",
  "😵‍💫": "SPIRALEYES",
  "🥴": "WOOZY",
  "😠": "ANGRY",
  "😡": "POUTING",
  "🤬": "CURSING",
  "😈": "DEVIL",
  "👿": "IMP",
  "🫠": "MELTING",
  "🫡": "SALUTE",
  "🤭": "GIGGLE",
  "🤫": "SHUSH",
  "🫣": "PEEKING",
  "🥹": "HOLDTEARS",
  "🫥": "INVISIBLE",
  "🤥": "LIAR",
  "🤧": "SNEEZE",
  "🤮": "VOMIT",
  "🤒": "SICK",
  "😷": "MASK",
  "🤓": "NERD",
  "🥸": "DISGUISE",
  // Gestures
  "👍": "THUMBSUP",
  "👎": "THUMBSDOWN",
  "👊": "FISTBUMP",
  "✊": "RAISEDFIST",
  "🤛": "LEFTFIST",
  "🤜": "RIGHTFIST",
  "👏": "CLAP",
  "🙌": "RAISEDHANDS",
  "👐": "OPENHANDS",
  "🤲": "PALMSUP",
  "🤝": "HANDSHAKE",
  "🙏": "PRAY",
  "🙇": "SORRY",
  "✌️": "VICTORY",
  "🤞": "CROSSFINGERS",
  "🤟": "LOVEYOU",
  "🤘": "ROCKON",
  "👈": "POINTLEFT",
  "👉": "POINTRIGHT",
  "👆": "POINTUP",
  "👇": "POINTDOWN",
  "☝️": "INDEXUP",
  "✋": "STOP",
  "👋": "WAVE",
  "💪": "FLEX",
  "🖖": "VULCAN",
  // Hearts & Symbols
  "🧡": "ORANGEHEART",
  "💛": "YELLOWHEART",
  "💚": "GREENHEART",
  "💙": "BLUEHEART",
  "💜": "PURPLEHEART",
  "🖤": "BLACKHEART",
  "🤍": "WHITEHEART",
  "🤎": "BROWNHEART",
  "💔": "BROKENHEART",
  "❣️": "HEARTEXCLAIM",
  "💯": "HUNDRED",
  "🔥": "FIRE",
  "⭐": "STAR",
  "💫": "DIZZYSTAR",
  "✨": "SPARKLES",
  "💥": "COLLISION",
  "💨": "DASH",
  "🎉": "PARTY",
  "🎊": "CONFETTI",
  // Animals
  "🐶": "DOG",
  "🐭": "MOUSE",
  "🐹": "HAMSTER",
  "🐰": "BUNNY",
  "🦊": "FOX",
  "🐻": "BEAR",
  "🐼": "PANDA",
  "🐨": "KOALA",
  "🐯": "TIGER",
  "🦁": "LION",
  "🐮": "COW",
  "🐷": "PIG",
  "🐸": "FROG",
  "🐵": "MONKEY",
  "🙉": "HEARNOEVIL",
  "🙊": "SPEAKNOEVIL",
  "🐔": "CHICKEN",
  "🐧": "PENGUIN",
  "🦅": "EAGLE",
  "🦉": "OWL",
  "🐺": "WOLF",
  "🐴": "HORSE",
  "🦄": "UNICORN",
  "🐝": "BEE",
  "🦋": "BUTTERFLY",
  "🐌": "SNAIL",
  "🐞": "LADYBUG",
  "🐍": "SNAKE",
  // Food & Drink
  "🍕": "PIZZA",
  "🍔": "BURGER",
  "🍟": "FRIES",
  "🎂": "CAKE",
  "🍩": "DONUT",
  "🍺": "BEER",
  "🥂": "CHEERS",
  "☕": "COFFEE",
  // Spooky & Special
  "💀": "REALSKULL",
  "👻": "GHOST",
  "👽": "ALIEN",
  "🤖": "ROBOT",
  "💩": "REALPOOP",
  "🎃": "PUMPKIN",
  // Misc Popular
  "🏆": "TROPHY",
  "🥇": "GOLD",
  "🎮": "GAMING",
  "🎵": "MUSICNOTE",
  "🎶": "MUSICNOTES",
  "🌹": "ROSE",
  "🌸": "BLOSSOM",
  "💎": "GEM",
  "👑": "CROWN",
  "🎁": "GIFT",
  "🚀": "ROCKET",
  "🌈": "RAINBOW",
  "🌙": "MOON",
  "❄️": "SNOWFLAKE",
  "🎈": "BALLOON",
  "🎯": "BULLSEYE",
  "⚽": "SOCCER",
  "🏀": "BASKETBALL",
  "💐": "BOUQUET",
  "🕊️": "DOVE",
  "🍀": "CLOVER",
  "🌻": "SUNFLOWER",
};

// Minimum gap (ms) between two animations to prevent spam
const THROTTLE_MS = 12000;

export default forwardRef(function ComboAnimationLayer({ chatId }, ref) {
  const socket = getSocket();

  const [effect, setEffect] = useState(null);
  // effect shape: { type: string, users: string[], active: boolean }

  const lastFiredRef = React.useRef(0);

  // Expose triggerAnimation so external code (e.g. EmojiAnimationPicker) can fire animations
  const triggerAnimation = useCallback((emoji) => {
    const type = EMOJI_MAP[emoji];
    if (!type) return;
    // Skip throttle for manual preview triggers (use a shorter 2s cooldown)
    const now = Date.now();
    if (now - lastFiredRef.current < 2000) return;
    lastFiredRef.current = now;
    setEffect({ type, users: [], active: true });
  }, []);

  useImperativeHandle(ref, () => ({ triggerAnimation }), [triggerAnimation]);

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

  // Listen for direct emoji animation triggers from other users
  const handleAnimation = useCallback(
    (data) => {
      if (data.chatId && chatId && data.chatId !== chatId) return;
      const type = EMOJI_MAP[data.emoji];
      if (!type) return;
      const now = Date.now();
      if (now - lastFiredRef.current < 2000) return;
      lastFiredRef.current = now;
      setEffect({ type, users: [], active: true });
    },
    [chatId]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(EMOJI_ANIMATION, handleAnimation);
    return () => { socket.off(EMOJI_ANIMATION, handleAnimation); };
  }, [socket, handleAnimation]);

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
      {type === "CATLAUGH"     && <CatLaughAnimation     active={active}               onDone={handleDone} />}
      {type === "CATHEART"     && <CatHeartAnimation     active={active}               onDone={handleDone} />}
      {type === "CATWRY"       && <CatWryAnimation       active={active}               onDone={handleDone} />}
      {type === "CATKISS"      && <CatKissAnimation      active={active}               onDone={handleDone} />}
      {type === "CATSCARED"    && <CatScaredAnimation    active={active}               onDone={handleDone} />}
      {type === "CATCRY"       && <CatCryAnimation       active={active}               onDone={handleDone} />}
      {type === "CATANGRY"     && <CatAngryAnimation     active={active}               onDone={handleDone} />}
      {type === "CATFACE"      && <CatFaceAnimation      active={active}               onDone={handleDone} />}
      {/* Generic template-driven animations (covers all new emojis) */}
      {GENERIC_EMOJI_CONFIGS[type] && <GenericEmojiAnimation config={GENERIC_EMOJI_CONFIGS[type]} active={active} onDone={handleDone} />}
    </>,
    document.body
  );
})
