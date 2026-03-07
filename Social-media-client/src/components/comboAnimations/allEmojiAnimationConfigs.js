/**
 * allEmojiAnimationConfigs.js
 * ───────────────────────────
 * Configuration for ALL generic emoji animations.
 * Each key matches a type in EMOJI_MAP.
 * GenericEmojiAnimation renders based on these configs.
 *
 * Config shape:
 *   emoji        — the emoji character displayed center-screen
 *   bg           — CSS background for the fullscreen overlay
 *   entry        — entry animation: pop|drop|spin|bounce|shake|tremble|flip|pulse
 *   text         — text shown below the emoji
 *   textColor    — CSS color for text
 *   textBg       — CSS background for text pill
 *   textShadow   — optional text-shadow color
 *   emojiSize    — font-size for emoji (default 5.5rem)
 *   emojiShadow  — drop-shadow color around the emoji
 *   particles    — { items: string[], count: number, type: fall|rise|burst|swirl }
 *   duration     — total animation time in ms (default 4500)
 *   screenEffect — "flash" | "shake" | null
 */

const C = {
  // ═══════════════════════════════════════════════════════════════
  // SMILEYS & FACES
  // ═══════════════════════════════════════════════════════════════

  // 😃 Grinning Face with Big Eyes
  HAPPY: {
    emoji: "😃", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,240,80,0.4) 0%,rgba(255,200,0,0.1) 100%)",
    entry: "bounce", text: "So happy! 😃", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✨","⭐","🌟"], count: 12, type: "burst" }, duration: 4500,
  },

  // 😄 Grinning Face with Smiling Eyes
  BIGGRIN: {
    emoji: "😄", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,60,0.4) 0%,rgba(255,200,0,0.1) 100%)",
    entry: "pop", text: "That's the spirit! 😄", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌟","✨","💛"], count: 10, type: "rise" }, duration: 4500,
  },

  // 🤣 Rolling on the Floor
  ROFL: {
    emoji: "🤣", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,100,0.4) 0%,rgba(255,200,50,0.15) 100%)",
    entry: "shake", text: "I can't stop! 🤣", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["😂","🤣","😹","💀"], count: 12, type: "fall" }, duration: 4500, screenEffect: "shake",
  },

  // 😊 Smiling Face with Smiling Eyes
  BLUSH: {
    emoji: "😊", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,200,200,0.4) 0%,rgba(255,180,180,0.1) 100%)",
    entry: "pop", text: "Aww, blushing! 😊", textColor: "#8a3050", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌸","✨","💕"], count: 8, type: "rise" }, duration: 4500,
  },

  // 😋 Yummy Face
  YUMMY: {
    emoji: "😋", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,100,0.35) 0%,rgba(255,180,60,0.1) 100%)",
    entry: "pop", text: "Yummy! 😋", textColor: "#7a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍕","🍔","🍩","🍰","🍫","🍪"], count: 12, type: "fall" }, duration: 4500,
  },

  // 🤩 Star-Struck
  STARSTRUCK: {
    emoji: "🤩", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,50,0.4) 0%,rgba(200,150,0,0.15) 100%)",
    entry: "spin", text: "Star struck! 🤩", textColor: "#7a6000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,200,0,0.6)",
    particles: { items: ["⭐","🌟","✨","💫"], count: 14, type: "burst" }, duration: 5000,
  },

  // 🤔 Thinking
  THINKING: {
    emoji: "🤔", bg: "radial-gradient(ellipse at 50% 50%,rgba(180,200,230,0.35) 0%,rgba(150,170,200,0.15) 100%)",
    entry: "pop", text: "Hmm, let me think... 🤔", textColor: "#445", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["❓","💭","🤔","❔"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🤨 Raised Eyebrow
  RAISEBROW: {
    emoji: "🤨", bg: "rgba(200,200,210,0.3)",
    entry: "pop", text: "Really? 🤨", textColor: "#444", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["❓","🔍"], count: 6, type: "rise" }, duration: 4000,
  },

  // 😐 Neutral
  NEUTRAL: {
    emoji: "😐", bg: "rgba(180,180,180,0.3)",
    entry: "pop", text: "...", textColor: "#555", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["➖"], count: 5, type: "fall" }, duration: 3500,
  },

  // 😑 Expressionless
  EXPRESSIONLESS: {
    emoji: "😑", bg: "rgba(160,160,170,0.35)",
    entry: "pop", text: "Meh.", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💤","➖"], count: 5, type: "fall" }, duration: 3500,
  },

  // 😶 No Mouth
  MUTE: {
    emoji: "😶", bg: "rgba(200,200,210,0.3)",
    entry: "pop", text: "...", textColor: "#666", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🔇","🤫"], count: 4, type: "rise" }, duration: 3500,
  },

  // 😪 Sleepy
  SLEEPY: {
    emoji: "😪", bg: "linear-gradient(180deg,rgba(100,120,180,0.3) 0%,rgba(60,80,140,0.4) 100%)",
    entry: "pop", text: "So sleepy... 😪", textColor: "#445", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["💤","😪","💧"], count: 8, type: "rise" }, duration: 4500,
  },

  // 😫 Tired
  TIRED: {
    emoji: "😫", bg: "rgba(180,170,160,0.35)",
    entry: "drop", text: "So tired... 😫", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💤","😩","💫"], count: 8, type: "fall" }, duration: 4500,
  },

  // 😜 Winking Tongue
  WINKTONGUE: {
    emoji: "😜", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,100,0.4) 0%,rgba(255,180,50,0.1) 100%)",
    entry: "bounce", text: "Just kidding! 😜", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎉","✨","😜","🎊"], count: 10, type: "burst" }, duration: 4500,
  },

  // 😝 Squinting Tongue
  SQUINTTONGUE: {
    emoji: "😝", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,80,0.4) 0%,rgba(255,200,50,0.1) 100%)",
    entry: "spin", text: "Blehhh! 😝", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌀","💫","😝","✨"], count: 10, type: "swirl" }, duration: 4500,
  },

  // 🤤 Drooling
  DROOL: {
    emoji: "🤤", bg: "radial-gradient(ellipse at 50% 60%,rgba(180,220,255,0.3) 0%,rgba(150,200,255,0.1) 100%)",
    entry: "pop", text: "Drooling... 🤤", textColor: "#446", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💧","💦","🤤"], count: 10, type: "fall" }, duration: 4500,
  },

  // 😒 Unamused
  UNAMUSED: {
    emoji: "😒", bg: "rgba(170,170,180,0.35)",
    entry: "pop", text: "Not amused 😒", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["😒","💤"], count: 5, type: "fall" }, duration: 4000,
  },

  // 😕 Confused
  CONFUSED: {
    emoji: "😕", bg: "rgba(190,190,200,0.3)",
    entry: "pop", text: "Huh? 😕", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["❓","❔","🌀"], count: 8, type: "swirl" }, duration: 4500,
  },

  // 🙃 Upside Down
  UPSIDEDOWN: {
    emoji: "🙃", bg: "linear-gradient(180deg,rgba(200,220,255,0.3) 0%,rgba(255,220,200,0.3) 100%)",
    entry: "flip", text: "Totally fine 🙃", textColor: "#556", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🙃","🙂","🔄"], count: 8, type: "swirl" }, duration: 4500,
  },

  // 🤑 Money Face
  MONEY: {
    emoji: "🤑", bg: "radial-gradient(ellipse at 50% 50%,rgba(100,200,100,0.35) 0%,rgba(50,150,50,0.1) 100%)",
    entry: "bounce", text: "Cha-ching! 🤑", textColor: "#1a5a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💵","💰","💲","🪙","💸"], count: 14, type: "fall" }, duration: 5000,
  },

  // 😲 Astonished
  ASTONISHED: {
    emoji: "😲", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,180,0.35) 0%,rgba(255,220,150,0.1) 100%)",
    entry: "pop", text: "No way! 😲", textColor: "#665500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["❗","⭐","💥"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🙁 Slightly Sad
  SLIGHTSAD: {
    emoji: "🙁", bg: "rgba(170,180,200,0.3)",
    entry: "pop", text: "A little sad 🙁", textColor: "#445", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["🍂","💧"], count: 6, type: "fall" }, duration: 4000,
  },

  // ☹️ Frowning
  FROWN: {
    emoji: "☹️", bg: "rgba(160,170,190,0.35)",
    entry: "pop", text: "Not great... ☹️", textColor: "#445", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["🍂","💧","☁️"], count: 8, type: "fall" }, duration: 4500,
  },

  // 😖 Confounded
  CONFOUNDED: {
    emoji: "😖", bg: "rgba(200,180,180,0.35)",
    entry: "tremble", text: "Ugh! 😖", textColor: "#664040", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💫","😖","❌"], count: 8, type: "burst" }, duration: 4000,
  },

  // 😞 Disappointed
  DISAPPOINTED: {
    emoji: "😞", bg: "linear-gradient(180deg,rgba(160,170,190,0.3) 0%,rgba(140,150,170,0.4) 100%)",
    entry: "pop", text: "Disappointed... 😞", textColor: "#445", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["🍂","💔","😞"], count: 6, type: "fall" }, duration: 4500,
  },

  // 😟 Worried
  WORRIED: {
    emoji: "😟", bg: "rgba(190,190,210,0.35)",
    entry: "tremble", text: "I'm worried 😟", textColor: "#445", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["😰","💭","❓"], count: 6, type: "rise" }, duration: 4500,
  },

  // 😤 Huffing (Steam from Nose)
  HUFFING: {
    emoji: "😤", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,180,0.35) 0%,rgba(255,160,140,0.15) 100%)",
    entry: "shake", text: "Hmph! 😤", textColor: "#7a3020", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💨","😤","💢"], count: 10, type: "rise" }, duration: 4500,
  },

  // 😢 Crying
  CRY: {
    emoji: "😢", bg: "linear-gradient(180deg,rgba(140,170,220,0.3) 0%,rgba(120,150,200,0.4) 100%)",
    entry: "pop", text: "Crying... 😢", textColor: "#335", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["💧","😢","💦"], count: 10, type: "fall" }, duration: 5000,
  },

  // 😭 Loud Crying
  SOBBING: {
    emoji: "😭", bg: "linear-gradient(180deg,rgba(120,150,210,0.35) 0%,rgba(80,110,180,0.45) 100%)",
    entry: "shake", text: "WAHHH! 😭", textColor: "#335", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["💧","😭","💦","🌊"], count: 16, type: "fall" }, duration: 5000, screenEffect: "shake",
  },

  // 😦 Frowning Open Mouth
  FROWNOPEN: {
    emoji: "😦", bg: "rgba(190,190,200,0.3)",
    entry: "pop", text: "Oh no... 😦", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["❗","😦"], count: 5, type: "fall" }, duration: 4000,
  },

  // 😧 Anguished
  ANGUISHED: {
    emoji: "😧", bg: "rgba(190,180,200,0.35)",
    entry: "tremble", text: "This is bad 😧", textColor: "#554", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💔","😧","❗"], count: 6, type: "burst" }, duration: 4000,
  },

  // 😨 Fearful
  FEARFUL: {
    emoji: "😨", bg: "linear-gradient(180deg,rgba(100,110,150,0.4) 0%,rgba(60,70,110,0.5) 100%)",
    entry: "tremble", text: "I'm scared! 😨", textColor: "#aab", textBg: "rgba(40,40,60,0.65)",
    particles: { items: ["😨","👻","💀","❄️"], count: 10, type: "fall" }, duration: 4500,
  },

  // 😩 Weary
  WEARY: {
    emoji: "😩", bg: "rgba(180,170,180,0.35)",
    entry: "drop", text: "I can't anymore... 😩", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💫","😩","💤"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🤯 Exploding Head
  EXPLODE: {
    emoji: "🤯", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,180,50,0.4) 0%,rgba(255,100,0,0.2) 100%)",
    entry: "pop", text: "MIND BLOWN! 🤯", textColor: "#7a3000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,100,0,0.6)",
    particles: { items: ["💥","🔥","✨","💫","⚡"], count: 16, type: "burst" }, duration: 5000, screenEffect: "flash",
  },

  // 😬 Grimacing
  GRIMACE: {
    emoji: "😬", bg: "rgba(200,200,210,0.3)",
    entry: "pop", text: "Yikes... 😬", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["😬","💀","😅"], count: 6, type: "burst" }, duration: 4000,
  },

  // 😰 Anxious Sweat
  ANXIOUS: {
    emoji: "😰", bg: "linear-gradient(180deg,rgba(180,200,230,0.3) 0%,rgba(150,170,200,0.4) 100%)",
    entry: "tremble", text: "So anxious... 😰", textColor: "#445", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["💧","😰","💦"], count: 10, type: "fall" }, duration: 4500,
  },

  // 😱 Screaming
  SCREAM: {
    emoji: "😱", bg: "radial-gradient(ellipse at 50% 50%,rgba(180,150,200,0.4) 0%,rgba(100,70,130,0.3) 100%)",
    entry: "shake", text: "AHHHH! 😱", textColor: "#dcc", textBg: "rgba(40,30,50,0.65)",
    emojiShadow: "rgba(200,100,255,0.5)",
    particles: { items: ["😱","💀","👻","⚡"], count: 12, type: "burst" }, duration: 4500, screenEffect: "flash",
  },

  // 🥵 Hot Face
  HOTFACE: {
    emoji: "🥵", bg: "radial-gradient(ellipse at 50% 60%,rgba(255,100,50,0.4) 0%,rgba(255,50,0,0.15) 100%)",
    entry: "pulse", text: "It's so hot! 🥵", textColor: "#7a2000", textBg: "rgba(255,255,255,0.6)",
    emojiShadow: "rgba(255,80,0,0.5)",
    particles: { items: ["🔥","☀️","🥵","💦"], count: 14, type: "rise" }, duration: 5000,
  },

  // 🥶 Cold Face
  COLDFACE: {
    emoji: "🥶", bg: "radial-gradient(ellipse at 50% 50%,rgba(150,200,255,0.4) 0%,rgba(100,160,255,0.2) 100%)",
    entry: "tremble", text: "Freezing! 🥶", textColor: "#2255aa", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(100,180,255,0.5)",
    particles: { items: ["❄️","🧊","🥶","💎"], count: 14, type: "fall" }, duration: 5000,
  },

  // 😳 Flushed
  FLUSHED: {
    emoji: "😳", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,180,180,0.4) 0%,rgba(255,150,150,0.15) 100%)",
    entry: "pop", text: "Omg... 😳", textColor: "#8a3040", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💗","😳","✨"], count: 8, type: "burst" }, duration: 4000,
  },

  // 🤪 Zany
  ZANY: {
    emoji: "🤪", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,100,0.4) 0%,rgba(200,100,255,0.2) 100%)",
    entry: "spin", text: "Going crazy! 🤪", textColor: "#6a3080", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎉","🤪","🌈","✨","🎊","💫"], count: 14, type: "swirl" }, duration: 5000, screenEffect: "shake",
  },

  // 😵 Dizzy
  DIZZY: {
    emoji: "😵", bg: "rgba(200,200,220,0.35)",
    entry: "spin", text: "So dizzy... 😵", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💫","⭐","🌀","😵"], count: 10, type: "swirl" }, duration: 4500,
  },

  // 😵‍💫 Face with Spiral Eyes
  SPIRALEYES: {
    emoji: "😵‍💫", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,180,230,0.35) 0%,rgba(170,150,200,0.2) 100%)",
    entry: "spin", text: "Everything's spinning... 😵‍💫", textColor: "#556", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🌀","💫","😵‍💫","⭐"], count: 10, type: "swirl" }, duration: 5000,
  },

  // 🥴 Woozy
  WOOZY: {
    emoji: "🥴", bg: "rgba(200,200,180,0.35)",
    entry: "shake", text: "Woozy... 🥴", textColor: "#665", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🥴","💫","🌀"], count: 8, type: "swirl" }, duration: 4500,
  },

  // 😠 Angry
  ANGRY: {
    emoji: "😠", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,130,100,0.35) 0%,rgba(200,60,40,0.2) 100%)",
    entry: "shake", text: "Grrrr! 😠", textColor: "#7a2020", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💢","😠","🔥"], count: 8, type: "burst" }, duration: 4500,
  },

  // 😡 Pouting
  POUTING: {
    emoji: "😡", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,100,80,0.4) 0%,rgba(200,40,20,0.25) 100%)",
    entry: "shake", text: "FURIOUS! 😡", textColor: "#ff4040", textBg: "rgba(60,10,10,0.65)",
    textShadow: "rgba(255,80,80,0.6)",
    particles: { items: ["💢","🔥","😡","💥"], count: 12, type: "burst" }, duration: 4500, screenEffect: "shake",
  },

  // 🤬 Cursing
  CURSING: {
    emoji: "🤬", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,50,30,0.4) 0%,rgba(100,20,10,0.3) 100%)",
    entry: "shake", text: "#$%@! 🤬", textColor: "#ff5050", textBg: "rgba(50,10,10,0.7)",
    textShadow: "rgba(255,60,60,0.7)",
    particles: { items: ["🤬","#️⃣","❗","💢","🔥","💥"], count: 14, type: "burst" }, duration: 5000, screenEffect: "shake",
  },

  // 😈 Devil Smile
  DEVIL: {
    emoji: "😈", bg: "radial-gradient(ellipse at 50% 50%,rgba(140,50,180,0.4) 0%,rgba(80,20,120,0.3) 100%)",
    entry: "drop", text: "Mwahaha! 😈", textColor: "#d090ff", textBg: "rgba(30,10,50,0.65)",
    textShadow: "rgba(180,80,255,0.6)",
    emojiShadow: "rgba(160,50,255,0.5)",
    particles: { items: ["🔥","😈","👿","💜"], count: 12, type: "rise" }, duration: 5000,
  },

  // 👿 Angry Devil
  IMP: {
    emoji: "👿", bg: "radial-gradient(ellipse at 50% 50%,rgba(100,30,150,0.45) 0%,rgba(50,10,80,0.4) 100%)",
    entry: "shake", text: "Evil! 👿", textColor: "#c070ff", textBg: "rgba(20,5,40,0.7)",
    textShadow: "rgba(150,50,255,0.7)",
    emojiShadow: "rgba(140,30,255,0.6)",
    particles: { items: ["🔥","👿","💜","⚡"], count: 12, type: "burst" }, duration: 5000,
  },

  // 🫠 Melting Face
  MELTING: {
    emoji: "🫠", bg: "radial-gradient(ellipse at 50% 60%,rgba(255,220,150,0.4) 0%,rgba(255,180,100,0.15) 100%)",
    entry: "pop", text: "I'm melting... 🫠", textColor: "#7a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🫠","💧","☀️"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🫡 Salute
  SALUTE: {
    emoji: "🫡", bg: "linear-gradient(180deg,rgba(100,140,200,0.3) 0%,rgba(80,120,180,0.2) 100%)",
    entry: "pop", text: "Yes sir! 🫡", textColor: "#345", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["⭐","🫡","✨"], count: 8, type: "burst" }, duration: 4000,
  },

  // 🤭 Face with Hand Over Mouth
  GIGGLE: {
    emoji: "🤭", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,230,0.35) 0%,rgba(255,200,210,0.15) 100%)",
    entry: "pop", text: "Tee-hee! 🤭", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🤭","✨","😊"], count: 6, type: "rise" }, duration: 4000,
  },

  // 🤫 Shushing
  SHUSH: {
    emoji: "🤫", bg: "rgba(200,200,220,0.3)",
    entry: "pop", text: "Shhh! 🤫", textColor: "#445", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🤫","🔇","💤"], count: 6, type: "rise" }, duration: 4000,
  },

  // 🫣 Peeking
  PEEKING: {
    emoji: "🫣", bg: "rgba(200,200,210,0.3)",
    entry: "pop", text: "Peeking... 🫣", textColor: "#556", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["👀","🫣","👁️"], count: 6, type: "burst" }, duration: 4000,
  },

  // 🥹 Holding Back Tears
  HOLDTEARS: {
    emoji: "🥹", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,210,240,0.3) 0%,rgba(180,190,220,0.2) 100%)",
    entry: "pop", text: "I'm fine... 🥹", textColor: "#445", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🥹","💧","✨","💕"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🫥 Dotted Line Face
  INVISIBLE: {
    emoji: "🫥", bg: "rgba(210,210,220,0.25)",
    entry: "pop", text: "Fading away... 🫥", textColor: "#888", textBg: "rgba(255,255,255,0.5)",
    particles: { items: ["🫥","💨","✨"], count: 5, type: "rise" }, duration: 4000,
  },

  // 🤥 Pinocchio
  LIAR: {
    emoji: "🤥", bg: "rgba(220,200,180,0.3)",
    entry: "pop", text: "Lies! 🤥", textColor: "#665540", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🤥","👃","🔴"], count: 6, type: "burst" }, duration: 4000,
  },

  // 🤧 Sneezing
  SNEEZE: {
    emoji: "🤧", bg: "rgba(200,210,220,0.3)",
    entry: "shake", text: "ACHOO! 🤧", textColor: "#556", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💦","🤧","💨","✨"], count: 10, type: "burst" }, duration: 4000, screenEffect: "shake",
  },

  // 🤮 Vomiting
  VOMIT: {
    emoji: "🤮", bg: "radial-gradient(ellipse at 50% 50%,rgba(140,200,100,0.35) 0%,rgba(100,160,60,0.2) 100%)",
    entry: "shake", text: "Ewww! 🤮", textColor: "#4a6020", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🤮","💚","🟢","💦"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🤒 Thermometer
  SICK: {
    emoji: "🤒", bg: "rgba(200,190,190,0.35)",
    entry: "tremble", text: "Feeling sick... 🤒", textColor: "#664040", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🤒","🌡️","💊","😷"], count: 6, type: "fall" }, duration: 4500,
  },

  // 😷 Mask
  MASK: {
    emoji: "😷", bg: "rgba(200,210,220,0.3)",
    entry: "pop", text: "Stay safe! 😷", textColor: "#456", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["😷","🧼","✨"], count: 6, type: "rise" }, duration: 4000,
  },

  // 🤓 Nerd
  NERD: {
    emoji: "🤓", bg: "radial-gradient(ellipse at 50% 50%,rgba(180,200,240,0.35) 0%,rgba(150,170,220,0.15) 100%)",
    entry: "bounce", text: "Actually... 🤓", textColor: "#335", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["📚","🤓","💡","✨"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🥸 Disguise
  DISGUISE: {
    emoji: "🥸", bg: "rgba(200,200,200,0.3)",
    entry: "pop", text: "Incognito! 🥸", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["🥸","🕵️","🔍"], count: 6, type: "burst" }, duration: 4000,
  },

  // ═══════════════════════════════════════════════════════════════
  // GESTURES & HANDS
  // ═══════════════════════════════════════════════════════════════

  // 👍 Thumbs Up
  THUMBSUP: {
    emoji: "👍", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,100,0.35) 0%,rgba(255,200,50,0.1) 100%)",
    entry: "bounce", text: "Nice! 👍", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✨","⭐","👍"], count: 8, type: "burst" }, duration: 4000,
  },

  // 👎 Thumbs Down
  THUMBSDOWN: {
    emoji: "👎", bg: "rgba(180,180,190,0.35)",
    entry: "drop", text: "Nope 👎", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["👎","❌","💔"], count: 6, type: "fall" }, duration: 4000,
  },

  // 👊 Fist Bump
  FISTBUMP: {
    emoji: "👊", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,150,0.35) 0%,rgba(255,170,100,0.15) 100%)",
    entry: "pop", text: "Fist bump! 👊", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💥","✨","⚡","💫"], count: 10, type: "burst" }, duration: 4000, screenEffect: "shake",
  },

  // ✊ Raised Fist
  RAISEDFIST: {
    emoji: "✊", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,100,0.35) 0%,rgba(255,170,50,0.15) 100%)",
    entry: "bounce", text: "Power! ✊", textColor: "#6a4000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💪","✊","🔥","✨"], count: 10, type: "burst" }, duration: 4000,
  },

  // 🤛 Left Fist
  LEFTFIST: {
    emoji: "🤛", bg: "radial-gradient(ellipse at 40% 50%,rgba(255,200,150,0.3) 0%,rgba(200,150,100,0.1) 100%)",
    entry: "pop", text: "Pow! 🤛", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💥","⚡"], count: 8, type: "burst" }, duration: 3500, screenEffect: "shake",
  },

  // 🤜 Right Fist
  RIGHTFIST: {
    emoji: "🤜", bg: "radial-gradient(ellipse at 60% 50%,rgba(255,200,150,0.3) 0%,rgba(200,150,100,0.1) 100%)",
    entry: "pop", text: "Bam! 🤜", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💥","⚡"], count: 8, type: "burst" }, duration: 3500, screenEffect: "shake",
  },

  // 👏 Clapping
  CLAP: {
    emoji: "👏", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,100,0.35) 0%,rgba(255,200,50,0.15) 100%)",
    entry: "pulse", text: "Bravo! 👏", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✨","🎉","👏","⭐"], count: 12, type: "burst" }, duration: 4500,
  },

  // 🙌 Raised Hands
  RAISEDHANDS: {
    emoji: "🙌", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,100,0.4) 0%,rgba(255,200,50,0.15) 100%)",
    entry: "bounce", text: "Woohoo! 🙌", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎉","🎊","✨","🌟","🎈"], count: 14, type: "burst" }, duration: 5000,
  },

  // 👐 Open Hands
  OPENHANDS: {
    emoji: "👐", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,200,0.3) 0%,rgba(255,220,160,0.1) 100%)",
    entry: "pop", text: "Open hands! 👐", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✨","💛","☀️"], count: 8, type: "burst" }, duration: 4000,
  },

  // 🤲 Palms Up
  PALMSUP: {
    emoji: "🤲", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,240,200,0.3) 0%,rgba(255,220,160,0.1) 100%)",
    entry: "pop", text: "Here you go! 🤲", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✨","💝","🌟"], count: 6, type: "rise" }, duration: 4000,
  },

  // 🤝 Handshake
  HANDSHAKE: {
    emoji: "🤝", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,220,255,0.3) 0%,rgba(180,200,240,0.15) 100%)",
    entry: "pop", text: "Deal! 🤝", textColor: "#345", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✨","🤝","⭐","💫"], count: 8, type: "burst" }, duration: 4000,
  },

  // 🙏 Pray / Thank You
  PRAY: {
    emoji: "🙏", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,180,0.4) 0%,rgba(255,200,130,0.15) 100%)",
    entry: "pop", text: "Please / Thanks 🙏", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,200,100,0.5)",
    particles: { items: ["✨","🙏","☀️","💛"], count: 10, type: "rise" }, duration: 5000,
  },

  // 🙇 I Am Sorry / Deep Bow
  SORRY: {
    emoji: "🙇", bg: "linear-gradient(180deg,rgba(180,200,230,0.35) 0%,rgba(140,160,200,0.45) 100%)",
    entry: "drop", text: "I'm so sorry 🙇", textColor: "#334", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(120,140,200,0.4)",
    particles: { items: ["🙇","💧","🌸","💜","✨"], count: 12, type: "fall" }, duration: 5000,
  },

  // ✌️ Victory
  VICTORY: {
    emoji: "✌️", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,230,255,0.35) 0%,rgba(170,200,240,0.15) 100%)",
    entry: "bounce", text: "Peace! ✌️", textColor: "#345", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["✌️","✨","🌟","☮️"], count: 8, type: "burst" }, duration: 4000,
  },

  // 🤞 Crossed Fingers
  CROSSFINGERS: {
    emoji: "🤞", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,160,0.35) 0%,rgba(255,210,120,0.15) 100%)",
    entry: "pop", text: "Fingers crossed! 🤞", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍀","✨","⭐","🤞"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🤟 Love You Gesture
  LOVEYOU: {
    emoji: "🤟", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,220,0.35) 0%,rgba(255,170,200,0.15) 100%)",
    entry: "bounce", text: "Love you! 🤟", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["❤️","🤟","💕","✨"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🤘 Rock On
  ROCKON: {
    emoji: "🤘", bg: "linear-gradient(180deg,rgba(40,30,60,0.5) 0%,rgba(20,15,40,0.6) 100%)",
    entry: "shake", text: "ROCK ON! 🤘", textColor: "#f0c040", textBg: "rgba(30,20,50,0.65)",
    textShadow: "rgba(240,180,50,0.6)",
    emojiShadow: "rgba(255,200,50,0.5)",
    particles: { items: ["⚡","🔥","🤘","🎸","💀"], count: 12, type: "burst" }, duration: 5000, screenEffect: "flash",
  },

  // 👈 Point Left
  POINTLEFT: {
    emoji: "👈", bg: "rgba(220,220,230,0.3)",
    entry: "pop", text: "That way!", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["⬅️","👈","✨"], count: 6, type: "burst" }, duration: 3500,
  },

  // 👉 Point Right
  POINTRIGHT: {
    emoji: "👉", bg: "rgba(220,220,230,0.3)",
    entry: "pop", text: "This way!", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["➡️","👉","✨"], count: 6, type: "burst" }, duration: 3500,
  },

  // 👆 Point Up
  POINTUP: {
    emoji: "👆", bg: "rgba(220,220,230,0.3)",
    entry: "bounce", text: "Up there!", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["⬆️","👆","✨"], count: 6, type: "rise" }, duration: 3500,
  },

  // 👇 Point Down
  POINTDOWN: {
    emoji: "👇", bg: "rgba(220,220,230,0.3)",
    entry: "drop", text: "Down here!", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["⬇️","👇","✨"], count: 6, type: "fall" }, duration: 3500,
  },

  // ☝️ Index Up
  INDEXUP: {
    emoji: "☝️", bg: "rgba(220,220,230,0.3)",
    entry: "bounce", text: "Listen up!", textColor: "#555", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💡","☝️","✨"], count: 6, type: "rise" }, duration: 3500,
  },

  // ✋ Stop
  STOP: {
    emoji: "✋", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,180,0.35) 0%,rgba(255,170,150,0.15) 100%)",
    entry: "pop", text: "Stop right there! ✋", textColor: "#7a3020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🛑","✋","⛔"], count: 6, type: "burst" }, duration: 4000,
  },

  // 👋 Wave
  WAVE: {
    emoji: "👋", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,180,0.35) 0%,rgba(255,210,150,0.15) 100%)",
    entry: "shake", text: "Hey there! 👋", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["👋","✨","🌟"], count: 8, type: "burst" }, duration: 4000,
  },

  // 💪 Flex
  FLEX: {
    emoji: "💪", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,100,0.35) 0%,rgba(255,170,50,0.15) 100%)",
    entry: "bounce", text: "Strong! 💪", textColor: "#6a4000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💪","🔥","⚡","✨"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🖖 Vulcan
  VULCAN: {
    emoji: "🖖", bg: "linear-gradient(180deg,rgba(40,40,80,0.4) 0%,rgba(20,20,60,0.5) 100%)",
    entry: "pop", text: "Live long & prosper 🖖", textColor: "#8899cc", textBg: "rgba(20,20,50,0.65)",
    particles: { items: ["✨","⭐","🌟","💫"], count: 8, type: "burst" }, duration: 4500,
  },

  // ═══════════════════════════════════════════════════════════════
  // HEARTS & SYMBOLS
  // ═══════════════════════════════════════════════════════════════

  // 🧡 Orange Heart
  ORANGEHEART: {
    emoji: "🧡", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,180,80,0.4) 0%,rgba(255,140,40,0.15) 100%)",
    entry: "pulse", text: "Warmth! 🧡", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🧡","✨","🔥"], count: 10, type: "rise" }, duration: 4500,
  },

  // 💛 Yellow Heart
  YELLOWHEART: {
    emoji: "💛", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,80,0.4) 0%,rgba(255,220,40,0.15) 100%)",
    entry: "pulse", text: "Sunshine love! 💛", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💛","☀️","✨","⭐"], count: 10, type: "rise" }, duration: 4500,
  },

  // 💚 Green Heart
  GREENHEART: {
    emoji: "💚", bg: "radial-gradient(ellipse at 50% 50%,rgba(100,220,100,0.35) 0%,rgba(60,180,60,0.15) 100%)",
    entry: "pulse", text: "Nature love! 💚", textColor: "#2a6a2a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💚","🍀","🌿","✨"], count: 10, type: "rise" }, duration: 4500,
  },

  // 💙 Blue Heart
  BLUEHEART: {
    emoji: "💙", bg: "radial-gradient(ellipse at 50% 50%,rgba(100,160,255,0.4) 0%,rgba(60,120,220,0.15) 100%)",
    entry: "pulse", text: "True blue! 💙", textColor: "#2244aa", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💙","💎","✨","🦋"], count: 10, type: "rise" }, duration: 4500,
  },

  // 💜 Purple Heart
  PURPLEHEART: {
    emoji: "💜", bg: "radial-gradient(ellipse at 50% 50%,rgba(180,100,255,0.4) 0%,rgba(140,60,220,0.15) 100%)",
    entry: "pulse", text: "Royal love! 💜", textColor: "#6030aa", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💜","✨","🔮","💫"], count: 10, type: "rise" }, duration: 4500,
  },

  // 🖤 Black Heart
  BLACKHEART: {
    emoji: "🖤", bg: "linear-gradient(180deg,rgba(40,40,50,0.5) 0%,rgba(20,20,30,0.6) 100%)",
    entry: "pop", text: "Dark love 🖤", textColor: "#aaa", textBg: "rgba(30,30,40,0.65)",
    particles: { items: ["🖤","🦇","🌑","✨"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🤍 White Heart
  WHITEHEART: {
    emoji: "🤍", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,255,255,0.4) 0%,rgba(240,240,250,0.2) 100%)",
    entry: "pop", text: "Pure love! 🤍", textColor: "#888", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🤍","✨","🕊️","💫"], count: 10, type: "rise" }, duration: 4500,
  },

  // 🤎 Brown Heart
  BROWNHEART: {
    emoji: "🤎", bg: "radial-gradient(ellipse at 50% 50%,rgba(180,130,80,0.35) 0%,rgba(150,100,50,0.15) 100%)",
    entry: "pulse", text: "Earthy love! 🤎", textColor: "#5a3a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🤎","🍂","🌰","✨"], count: 8, type: "fall" }, duration: 4500,
  },

  // 💔 Broken Heart
  BROKENHEART: {
    emoji: "💔", bg: "linear-gradient(180deg,rgba(200,150,160,0.35) 0%,rgba(160,120,130,0.4) 100%)",
    entry: "shake", text: "Heartbroken... 💔", textColor: "#7a3040", textBg: "rgba(255,255,255,0.55)",
    particles: { items: ["💔","😢","💧","🥀"], count: 10, type: "fall" }, duration: 5000,
  },

  // ❣️ Heart Exclamation
  HEARTEXCLAIM: {
    emoji: "❣️", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,180,200,0.4) 0%,rgba(255,150,180,0.15) 100%)",
    entry: "bounce", text: "Love! ❣️", textColor: "#a02050", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["❣️","❤️","✨"], count: 8, type: "burst" }, duration: 4000,
  },

  // 💯 100
  HUNDRED: {
    emoji: "💯", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,100,0.4) 0%,rgba(255,150,50,0.15) 100%)",
    entry: "bounce", text: "PERFECT! 💯", textColor: "#7a3000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,100,0,0.5)",
    particles: { items: ["💯","🔥","⭐","✨","🏆"], count: 14, type: "burst" }, duration: 5000,
  },

  // 🔥 Fire
  FIRE: {
    emoji: "🔥", bg: "radial-gradient(ellipse at 50% 60%,rgba(255,150,50,0.4) 0%,rgba(255,80,0,0.2) 100%)",
    entry: "pulse", text: "LIT! 🔥", textColor: "#ff6020", textBg: "rgba(40,10,0,0.65)",
    textShadow: "rgba(255,80,0,0.6)",
    emojiShadow: "rgba(255,100,0,0.7)",
    particles: { items: ["🔥","💥","✨","⚡"], count: 14, type: "rise" }, duration: 5000,
  },

  // ⭐ Star
  STAR: {
    emoji: "⭐", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,230,100,0.4) 0%,rgba(255,200,50,0.15) 100%)",
    entry: "spin", text: "Shining star! ⭐", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,200,0,0.5)",
    particles: { items: ["⭐","🌟","✨","💫"], count: 12, type: "burst" }, duration: 4500,
  },

  // 💫 Dizzy Star
  DIZZYSTAR: {
    emoji: "💫", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,180,0.35) 0%,rgba(255,220,140,0.15) 100%)",
    entry: "spin", text: "Whoa! 💫", textColor: "#6a5500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💫","⭐","✨","🌟"], count: 10, type: "swirl" }, duration: 4500,
  },

  // ✨ Sparkles
  SPARKLES: {
    emoji: "✨", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,200,0.4) 0%,rgba(255,220,160,0.15) 100%)",
    entry: "spin", text: "Sparkling! ✨", textColor: "#6a5500", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,220,100,0.5)",
    particles: { items: ["✨","🌟","⭐","💛"], count: 14, type: "burst" }, duration: 5000,
  },

  // 💥 Collision
  COLLISION: {
    emoji: "💥", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,180,80,0.4) 0%,rgba(255,120,20,0.2) 100%)",
    entry: "pop", text: "BOOM! 💥", textColor: "#7a3000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,120,0,0.6)",
    particles: { items: ["💥","🔥","⚡","✨","💫"], count: 14, type: "burst" }, duration: 4500, screenEffect: "flash",
  },

  // 💨 Dash
  DASH: {
    emoji: "💨", bg: "rgba(220,230,240,0.3)",
    entry: "pop", text: "Whoooosh! 💨", textColor: "#556", textBg: "rgba(255,255,255,0.6)",
    particles: { items: ["💨","☁️","🌬️"], count: 10, type: "rise" }, duration: 4000,
  },

  // 🎉 Party Popper
  PARTY: {
    emoji: "🎉", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,100,0.4) 0%,rgba(255,180,50,0.15) 100%)",
    entry: "bounce", text: "PARTY TIME! 🎉", textColor: "#6a4000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎉","🎊","🎈","✨","🌟","🎶"], count: 16, type: "burst" }, duration: 5000,
  },

  // 🎊 Confetti Ball
  CONFETTI: {
    emoji: "🎊", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,100,0.4) 0%,rgba(220,160,50,0.15) 100%)",
    entry: "spin", text: "Celebration! 🎊", textColor: "#6a4000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎊","🎉","🎈","✨","🎶","💃"], count: 16, type: "fall" }, duration: 5000,
  },

  // ═══════════════════════════════════════════════════════════════
  // ANIMALS
  // ═══════════════════════════════════════════════════════════════

  // 🐶 Dog
  DOG: {
    emoji: "🐶", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,170,120,0.35) 0%,rgba(170,140,90,0.15) 100%)",
    entry: "bounce", text: "Woof woof! 🐶", textColor: "#5a4020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐾","🦴","🐶","❤️"], count: 10, type: "fall" }, duration: 4500,
  },

  // 🐭 Mouse
  MOUSE: {
    emoji: "🐭", bg: "rgba(220,220,230,0.3)",
    entry: "pop", text: "Squeak! 🐭", textColor: "#666", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐭","🧀","🐾"], count: 6, type: "burst" }, duration: 4000,
  },

  // 🐹 Hamster
  HAMSTER: {
    emoji: "🐹", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,220,180,0.35) 0%,rgba(255,200,150,0.15) 100%)",
    entry: "bounce", text: "So fluffy! 🐹", textColor: "#7a5530", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐹","🌻","✨","🌸"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🐰 Bunny
  BUNNY: {
    emoji: "🐰", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,210,220,0.35) 0%,rgba(255,190,200,0.15) 100%)",
    entry: "bounce", text: "Hop hop! 🐰", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐰","🥕","🌸","✨"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🦊 Fox
  FOX: {
    emoji: "🦊", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,180,80,0.35) 0%,rgba(255,150,50,0.15) 100%)",
    entry: "pop", text: "Sly fox! 🦊", textColor: "#7a4000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🦊","🍂","✨","🍁"], count: 8, type: "swirl" }, duration: 4500,
  },

  // 🐻 Bear
  BEAR: {
    emoji: "🐻", bg: "radial-gradient(ellipse at 50% 55%,rgba(180,140,100,0.35) 0%,rgba(150,110,70,0.15) 100%)",
    entry: "bounce", text: "Bear hug! 🐻", textColor: "#5a3a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐻","🍯","🐾","💕"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🐼 Panda
  PANDA: {
    emoji: "🐼", bg: "radial-gradient(ellipse at 50% 55%,rgba(220,230,240,0.35) 0%,rgba(200,210,220,0.15) 100%)",
    entry: "bounce", text: "Panda power! 🐼", textColor: "#333", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐼","🎋","🌿","✨"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🐨 Koala
  KOALA: {
    emoji: "🐨", bg: "radial-gradient(ellipse at 50% 55%,rgba(180,190,200,0.35) 0%,rgba(150,160,170,0.15) 100%)",
    entry: "pop", text: "Cuteness overload! 🐨", textColor: "#555", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐨","🍃","🌿","💤"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🐯 Tiger
  TIGER: {
    emoji: "🐯", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,200,80,0.4) 0%,rgba(255,160,30,0.15) 100%)",
    entry: "shake", text: "ROARR! 🐯", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐯","🔥","⚡","🐾"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🦁 Lion
  LION: {
    emoji: "🦁", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,200,80,0.4) 0%,rgba(200,150,30,0.15) 100%)",
    entry: "shake", text: "King of the jungle! 🦁", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,180,0,0.4)",
    particles: { items: ["🦁","👑","🔥","✨"], count: 10, type: "burst" }, duration: 5000,
  },

  // 🐮 Cow
  COW: {
    emoji: "🐮", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,225,200,0.35) 0%,rgba(170,200,170,0.15) 100%)",
    entry: "pop", text: "Mooo! 🐮", textColor: "#445540", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐮","🌾","🥛","🌻"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🐷 Pig
  PIG: {
    emoji: "🐷", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,200,210,0.35) 0%,rgba(255,180,190,0.15) 100%)",
    entry: "bounce", text: "Oink oink! 🐷", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐷","🐽","✨","🌸"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🐸 Frog
  FROG: {
    emoji: "🐸", bg: "radial-gradient(ellipse at 50% 55%,rgba(140,200,100,0.35) 0%,rgba(100,170,60,0.15) 100%)",
    entry: "bounce", text: "Ribbit! 🐸", textColor: "#3a5a20", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐸","🍀","💧","🌿"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🐵 Monkey
  MONKEY: {
    emoji: "🐵", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,170,120,0.35) 0%,rgba(170,140,90,0.15) 100%)",
    entry: "bounce", text: "Ooh ooh! 🐵", textColor: "#5a4020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐵","🍌","🌴","✨"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🙉 Hear No Evil
  HEARNOEVIL: {
    emoji: "🙉", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,170,130,0.35) 0%,rgba(170,140,100,0.15) 100%)",
    entry: "pop", text: "La la la! 🙉", textColor: "#5a4020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🙉","🎵","🔇","✨"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🙊 Speak No Evil
  SPEAKNOEVIL: {
    emoji: "🙊", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,170,130,0.35) 0%,rgba(170,140,100,0.15) 100%)",
    entry: "pop", text: "Oops! 🙊", textColor: "#5a4020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🙊","🤭","💨","✨"], count: 8, type: "burst" }, duration: 4000,
  },

  // 🐔 Chicken
  CHICKEN: {
    emoji: "🐔", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,230,180,0.35) 0%,rgba(255,200,130,0.15) 100%)",
    entry: "bounce", text: "Bawk bawk! 🐔", textColor: "#7a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐔","🥚","🐣","✨"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🐧 Penguin
  PENGUIN: {
    emoji: "🐧", bg: "radial-gradient(ellipse at 50% 55%,rgba(180,210,240,0.35) 0%,rgba(150,180,220,0.15) 100%)",
    entry: "bounce", text: "Waddle waddle! 🐧", textColor: "#334", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐧","❄️","🧊","✨"], count: 10, type: "fall" }, duration: 4500,
  },

  // 🦅 Eagle
  EAGLE: {
    emoji: "🦅", bg: "linear-gradient(180deg,rgba(140,180,240,0.35) 0%,rgba(100,140,200,0.2) 100%)",
    entry: "drop", text: "Soaring high! 🦅", textColor: "#345", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🦅","☁️","✨","🌤️"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🦉 Owl
  OWL: {
    emoji: "🦉", bg: "linear-gradient(180deg,rgba(60,50,80,0.4) 0%,rgba(40,30,60,0.5) 100%)",
    entry: "pop", text: "Hoo hoo! 🦉", textColor: "#c9a060", textBg: "rgba(30,20,50,0.65)",
    particles: { items: ["🦉","🌙","⭐","✨"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🐺 Wolf
  WOLF: {
    emoji: "🐺", bg: "linear-gradient(180deg,rgba(80,90,110,0.4) 0%,rgba(50,60,80,0.5) 100%)",
    entry: "shake", text: "Awooo! 🐺", textColor: "#aab", textBg: "rgba(30,30,50,0.65)",
    particles: { items: ["🐺","🌙","⭐","🐾"], count: 10, type: "rise" }, duration: 5000,
  },

  // 🐴 Horse
  HORSE: {
    emoji: "🐴", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,170,120,0.35) 0%,rgba(170,140,90,0.15) 100%)",
    entry: "bounce", text: "Neigh! 🐴", textColor: "#5a3a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐴","🐾","🌾","✨"], count: 8, type: "burst" }, duration: 4500,
  },

  // 🦄 Unicorn
  UNICORN: {
    emoji: "🦄", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,255,0.4) 0%,rgba(200,150,255,0.2) 100%)",
    entry: "spin", text: "Magical! 🦄", textColor: "#8040aa", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(200,100,255,0.5)",
    particles: { items: ["🦄","🌈","✨","💜","⭐","🌟"], count: 14, type: "burst" }, duration: 5000,
  },

  // 🐝 Bee
  BEE: {
    emoji: "🐝", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,240,120,0.35) 0%,rgba(255,220,80,0.15) 100%)",
    entry: "bounce", text: "Buzz buzz! 🐝", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐝","🍯","🌻","✨"], count: 8, type: "swirl" }, duration: 4500,
  },

  // 🦋 Butterfly
  BUTTERFLY: {
    emoji: "🦋", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,220,255,0.35) 0%,rgba(170,190,240,0.15) 100%)",
    entry: "pop", text: "So pretty! 🦋", textColor: "#4466aa", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🦋","🌸","✨","🌺"], count: 10, type: "swirl" }, duration: 5000,
  },

  // 🐌 Snail
  SNAIL: {
    emoji: "🐌", bg: "radial-gradient(ellipse at 50% 60%,rgba(180,200,160,0.3) 0%,rgba(150,170,130,0.15) 100%)",
    entry: "pop", text: "Slow and steady! 🐌", textColor: "#556640", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐌","🍃","💧","✨"], count: 6, type: "fall" }, duration: 5000,
  },

  // 🐞 Ladybug
  LADYBUG: {
    emoji: "🐞", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,180,180,0.35) 0%,rgba(255,150,150,0.15) 100%)",
    entry: "bounce", text: "Lucky bug! 🐞", textColor: "#7a2020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐞","🍀","✨","🌸"], count: 8, type: "swirl" }, duration: 4500,
  },

  // 🐍 Snake
  SNAKE: {
    emoji: "🐍", bg: "radial-gradient(ellipse at 50% 55%,rgba(140,180,100,0.35) 0%,rgba(100,150,60,0.15) 100%)",
    entry: "pop", text: "Hissss! 🐍", textColor: "#3a5a20", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🐍","🌿","✨"], count: 6, type: "swirl" }, duration: 4500,
  },

  // ═══════════════════════════════════════════════════════════════
  // FOOD, DRINK & TREATS
  // ═══════════════════════════════════════════════════════════════

  // 🍕 Pizza
  PIZZA: {
    emoji: "🍕", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,200,100,0.35) 0%,rgba(255,170,60,0.15) 100%)",
    entry: "spin", text: "Pizza time! 🍕", textColor: "#7a4500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍕","🧀","🍅","✨"], count: 10, type: "fall" }, duration: 4500,
  },

  // 🍔 Burger
  BURGER: {
    emoji: "🍔", bg: "radial-gradient(ellipse at 50% 55%,rgba(200,170,100,0.35) 0%,rgba(170,140,70,0.15) 100%)",
    entry: "drop", text: "Burger time! 🍔", textColor: "#5a3a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍔","🍟","🥤","✨"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🍟 Fries
  FRIES: {
    emoji: "🍟", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,230,130,0.35) 0%,rgba(255,200,80,0.15) 100%)",
    entry: "bounce", text: "Fries! 🍟", textColor: "#7a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍟","🧂","✨"], count: 8, type: "fall" }, duration: 4000,
  },

  // 🎂 Birthday Cake
  CAKE: {
    emoji: "🎂", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,220,0.4) 0%,rgba(255,170,200,0.15) 100%)",
    entry: "bounce", text: "Happy Birthday! 🎂", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎂","🎁","🎈","🎉","✨","🌟"], count: 14, type: "burst" }, duration: 5000,
  },

  // 🍩 Donut
  DONUT: {
    emoji: "🍩", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,200,210,0.35) 0%,rgba(255,180,190,0.15) 100%)",
    entry: "spin", text: "Donut worry be happy! 🍩", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍩","🍪","✨","🍫"], count: 8, type: "fall" }, duration: 4500,
  },

  // 🍺 Beer
  BEER: {
    emoji: "🍺", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,230,140,0.35) 0%,rgba(255,200,80,0.15) 100%)",
    entry: "bounce", text: "Cheers! 🍺", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍺","🫧","✨","🎉"], count: 10, type: "rise" }, duration: 4500,
  },

  // 🥂 Champagne
  CHEERS: {
    emoji: "🥂", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,240,180,0.4) 0%,rgba(255,220,140,0.15) 100%)",
    entry: "bounce", text: "Cheers! 🥂", textColor: "#6a5500", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,220,100,0.4)",
    particles: { items: ["🥂","✨","🫧","🎉","🌟"], count: 12, type: "rise" }, duration: 5000,
  },

  // ☕ Coffee
  COFFEE: {
    emoji: "☕", bg: "radial-gradient(ellipse at 50% 55%,rgba(180,140,100,0.35) 0%,rgba(140,100,60,0.15) 100%)",
    entry: "pop", text: "Coffee time! ☕", textColor: "#5a3a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["☕","☁️","✨","💛"], count: 8, type: "rise" }, duration: 4500,
  },

  // ═══════════════════════════════════════════════════════════════
  // SPOOKY & SPECIAL
  // ═══════════════════════════════════════════════════════════════

  // 💀 Skull
  REALSKULL: {
    emoji: "💀", bg: "linear-gradient(180deg,rgba(30,30,40,0.5) 0%,rgba(15,15,25,0.6) 100%)",
    entry: "shake", text: "I'm dead 💀", textColor: "#ccc", textBg: "rgba(20,20,30,0.65)",
    particles: { items: ["💀","☠️","🦴","👻"], count: 10, type: "fall" }, duration: 4500,
  },

  // 👻 Ghost
  GHOST: {
    emoji: "👻", bg: "linear-gradient(180deg,rgba(60,60,80,0.4) 0%,rgba(30,30,50,0.5) 100%)",
    entry: "pop", text: "Boo! 👻", textColor: "#ccd", textBg: "rgba(30,30,50,0.65)",
    particles: { items: ["👻","💀","🕯️","✨"], count: 10, type: "rise" }, duration: 4500,
  },

  // 👽 Alien
  ALIEN: {
    emoji: "👽", bg: "radial-gradient(ellipse at 50% 50%,rgba(100,200,100,0.35) 0%,rgba(50,150,50,0.2) 100%)",
    entry: "spin", text: "Take me to your leader 👽", textColor: "#2a6a2a", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(100,255,100,0.5)",
    particles: { items: ["👽","🛸","✨","⭐"], count: 10, type: "swirl" }, duration: 5000,
  },

  // 🤖 Robot
  ROBOT: {
    emoji: "🤖", bg: "linear-gradient(180deg,rgba(100,120,150,0.35) 0%,rgba(70,90,120,0.3) 100%)",
    entry: "bounce", text: "Beep boop! 🤖", textColor: "#556", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🤖","⚡","🔧","✨"], count: 8, type: "burst" }, duration: 4500,
  },

  // 💩 Poop (real)
  REALPOOP: {
    emoji: "💩", bg: "radial-gradient(ellipse at 50% 55%,rgba(160,120,80,0.35) 0%,rgba(130,90,50,0.15) 100%)",
    entry: "drop", text: "Oh crap! 💩", textColor: "#5a3a1a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["💩","🪰","✨"], count: 8, type: "fall" }, duration: 4000,
  },

  // 🎃 Pumpkin
  PUMPKIN: {
    emoji: "🎃", bg: "linear-gradient(180deg,rgba(50,40,60,0.5) 0%,rgba(30,20,40,0.6) 100%)",
    entry: "bounce", text: "Spooky! 🎃", textColor: "#ff9030", textBg: "rgba(30,20,40,0.65)",
    textShadow: "rgba(255,140,40,0.6)",
    particles: { items: ["🎃","👻","🦇","🕷️","✨"], count: 12, type: "fall" }, duration: 5000,
  },

  // ═══════════════════════════════════════════════════════════════
  // MISC POPULAR
  // ═══════════════════════════════════════════════════════════════

  // 🏆 Trophy
  TROPHY: {
    emoji: "🏆", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,100,0.4) 0%,rgba(255,190,40,0.15) 100%)",
    entry: "bounce", text: "Winner! 🏆", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,200,0,0.5)",
    particles: { items: ["🏆","🥇","✨","🌟","🎉"], count: 14, type: "burst" }, duration: 5000,
  },

  // 🥇 Gold Medal
  GOLD: {
    emoji: "🥇", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,80,0.4) 0%,rgba(255,190,30,0.15) 100%)",
    entry: "spin", text: "Gold! 🥇", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,200,0,0.5)",
    particles: { items: ["🥇","✨","⭐","🌟"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🎮 Gaming
  GAMING: {
    emoji: "🎮", bg: "linear-gradient(180deg,rgba(40,40,70,0.45) 0%,rgba(20,20,50,0.5) 100%)",
    entry: "bounce", text: "Game on! 🎮", textColor: "#80c0ff", textBg: "rgba(20,20,50,0.65)",
    particles: { items: ["🎮","🕹️","⭐","✨"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🎵 Music Note
  MUSICNOTE: {
    emoji: "🎵", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,180,255,0.35) 0%,rgba(170,150,230,0.15) 100%)",
    entry: "bounce", text: "Vibing! 🎵", textColor: "#5030aa", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎵","🎶","🎤","✨"], count: 10, type: "rise" }, duration: 4500,
  },

  // 🎶 Music Notes
  MUSICNOTES: {
    emoji: "🎶", bg: "radial-gradient(ellipse at 50% 50%,rgba(220,200,255,0.35) 0%,rgba(190,170,240,0.15) 100%)",
    entry: "spin", text: "Music! 🎶", textColor: "#5030aa", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎶","🎵","🎤","✨","🎧"], count: 12, type: "swirl" }, duration: 5000,
  },

  // 🌹 Rose
  ROSE: {
    emoji: "🌹", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,180,190,0.4) 0%,rgba(255,150,170,0.15) 100%)",
    entry: "pop", text: "A rose for you 🌹", textColor: "#a02050", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌹","🌸","🌺","💕","✨"], count: 12, type: "fall" }, duration: 5000,
  },

  // 🌸 Cherry Blossom
  BLOSSOM: {
    emoji: "🌸", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,210,230,0.4) 0%,rgba(255,190,210,0.15) 100%)",
    entry: "pop", text: "Beautiful! 🌸", textColor: "#885070", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌸","🌺","✨","💮","🌷"], count: 14, type: "fall" }, duration: 5000,
  },

  // 💎 Gem
  GEM: {
    emoji: "💎", bg: "radial-gradient(ellipse at 50% 50%,rgba(150,200,255,0.4) 0%,rgba(120,170,240,0.15) 100%)",
    entry: "spin", text: "Precious! 💎", textColor: "#2255aa", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(100,180,255,0.5)",
    particles: { items: ["💎","✨","💍","🌟"], count: 10, type: "burst" }, duration: 4500,
  },

  // 👑 Crown
  CROWN: {
    emoji: "👑", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,220,100,0.4) 0%,rgba(255,190,50,0.15) 100%)",
    entry: "drop", text: "Royalty! 👑", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    emojiShadow: "rgba(255,200,0,0.5)",
    particles: { items: ["👑","✨","💎","⭐"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🎁 Gift
  GIFT: {
    emoji: "🎁", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,200,0.35) 0%,rgba(255,170,170,0.15) 100%)",
    entry: "bounce", text: "A gift for you! 🎁", textColor: "#884040", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎁","✨","🎀","🎉","🌟"], count: 12, type: "burst" }, duration: 5000,
  },

  // 🚀 Rocket
  ROCKET: {
    emoji: "🚀", bg: "linear-gradient(180deg,rgba(20,30,60,0.5) 0%,rgba(10,15,40,0.6) 100%)",
    entry: "bounce", text: "To the moon! 🚀", textColor: "#80b0ff", textBg: "rgba(20,20,50,0.65)",
    textShadow: "rgba(100,150,255,0.5)",
    emojiShadow: "rgba(255,100,50,0.5)",
    particles: { items: ["🚀","⭐","✨","🌟","🔥"], count: 14, type: "rise" }, duration: 5000,
  },

  // 🌈 Rainbow
  RAINBOW: {
    emoji: "🌈", bg: "linear-gradient(180deg,rgba(255,100,100,0.15),rgba(255,200,100,0.15),rgba(255,255,100,0.15),rgba(100,255,100,0.15),rgba(100,100,255,0.15),rgba(200,100,255,0.15))",
    entry: "pop", text: "Rainbow vibes! 🌈", textColor: "#556", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌈","❤️","🧡","💛","💚","💙","💜"], count: 14, type: "rise" }, duration: 5000,
  },

  // 🌙 Moon
  MOON: {
    emoji: "🌙", bg: "linear-gradient(180deg,rgba(20,25,50,0.5) 0%,rgba(10,12,30,0.6) 100%)",
    entry: "pop", text: "Goodnight! 🌙", textColor: "#ccc080", textBg: "rgba(20,20,40,0.65)",
    textShadow: "rgba(200,200,100,0.5)",
    emojiShadow: "rgba(255,255,150,0.4)",
    particles: { items: ["🌙","⭐","✨","💤"], count: 10, type: "rise" }, duration: 5000,
  },

  // ❄️ Snowflake
  SNOWFLAKE: {
    emoji: "❄️", bg: "radial-gradient(ellipse at 50% 50%,rgba(200,220,255,0.4) 0%,rgba(170,200,255,0.2) 100%)",
    entry: "spin", text: "Let it snow! ❄️", textColor: "#2255aa", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["❄️","🌨️","✨","💎"], count: 16, type: "fall" }, duration: 5000,
  },

  // 🎈 Balloon
  BALLOON: {
    emoji: "🎈", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,200,200,0.3) 0%,rgba(255,170,170,0.1) 100%)",
    entry: "bounce", text: "Party! 🎈", textColor: "#884040", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎈","🎉","✨","🎊"], count: 10, type: "rise" }, duration: 4500,
  },

  // 🎯 Bullseye
  BULLSEYE: {
    emoji: "🎯", bg: "rgba(220,220,230,0.3)",
    entry: "pop", text: "Bullseye! 🎯", textColor: "#7a2020", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🎯","✨","⭐","💥"], count: 8, type: "burst" }, duration: 4000,
  },

  // ⚽ Soccer
  SOCCER: {
    emoji: "⚽", bg: "radial-gradient(ellipse at 50% 60%,rgba(100,180,100,0.35) 0%,rgba(60,140,60,0.15) 100%)",
    entry: "bounce", text: "GOAAAL! ⚽", textColor: "#2a5a2a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["⚽","🏆","✨","🎉"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🏀 Basketball
  BASKETBALL: {
    emoji: "🏀", bg: "radial-gradient(ellipse at 50% 50%,rgba(255,160,80,0.35) 0%,rgba(255,120,40,0.15) 100%)",
    entry: "bounce", text: "Swish! 🏀", textColor: "#7a3500", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🏀","🏆","✨","🔥"], count: 10, type: "burst" }, duration: 4500,
  },

  // 💐 Bouquet
  BOUQUET: {
    emoji: "💐", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,210,220,0.4) 0%,rgba(255,190,200,0.15) 100%)",
    entry: "pop", text: "Flowers for you! 💐", textColor: "#884060", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌸","🌹","🌺","🌷","✨","💕"], count: 14, type: "fall" }, duration: 5000,
  },

  // 🕊️ Dove
  DOVE: {
    emoji: "🕊️", bg: "radial-gradient(ellipse at 50% 50%,rgba(230,240,255,0.35) 0%,rgba(210,220,240,0.15) 100%)",
    entry: "pop", text: "Peace 🕊️", textColor: "#556", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🕊️","☮️","✨","🤍"], count: 8, type: "rise" }, duration: 4500,
  },

  // 🍀 Clover
  CLOVER: {
    emoji: "🍀", bg: "radial-gradient(ellipse at 50% 55%,rgba(100,200,100,0.35) 0%,rgba(60,160,60,0.15) 100%)",
    entry: "spin", text: "Lucky! 🍀", textColor: "#2a5a2a", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🍀","✨","🌟","💚"], count: 10, type: "burst" }, duration: 4500,
  },

  // 🌻 Sunflower
  SUNFLOWER: {
    emoji: "🌻", bg: "radial-gradient(ellipse at 50% 55%,rgba(255,230,100,0.4) 0%,rgba(255,210,60,0.15) 100%)",
    entry: "pop", text: "Sunshine! 🌻", textColor: "#6a5000", textBg: "rgba(255,255,255,0.65)",
    particles: { items: ["🌻","☀️","✨","💛"], count: 10, type: "burst" }, duration: 4500,
  },
};

export default C;
