import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { EMOJI_MAP } from "../comboAnimations/ComboAnimationLayer";

// Friendly labels for each emoji so we can search by name
const EMOJI_LABELS = {
  "💍": "Wedding Ring",
  "💋": "Kiss",
  "❤️": "Red Heart",
  "👀": "Eyes",
  "😂": "Laughing",
  "🙈": "Peek-a-boo",
  "😮‍💨": "Sigh",
  "☀️": "Sun",
  "🙂": "Smile",
  "💤": "Snooze",
  "💕": "Two Hearts",
  "💞": "Revolving Hearts",
  "💓": "Heartbeat",
  "💘": "Cupid Heart",
  "💗": "Growing Heart",
  "💖": "Sparkle Heart",
  "💝": "Ribbon Heart",
  "💌": "Love Letter",
  "😉": "Wink",
  "😎": "Cool",
  "🥲": "Bittersweet",
  "😙": "Gentle Kiss",
  "😗": "Pucker",
  "🥰": "Smiling Hearts",
  "😘": "Blow Kiss",
  "😍": "Heart Eyes",
  "😅": "Awkward",
  "😆": "Giggling",
  "😁": "Beaming",
  "😀": "Grin",
  "🤗": "Hug",
  "🥱": "Yawn",
  "😴": "Deep Sleep",
  "😶‍🌫️": "Cloud Head",
  "🙄": "Eye Roll",
  "😏": "Smirk",
  "😣": "Strain",
  "😥": "Gloom",
  "😮": "Wow",
  "🤐": "Zip",
  "😯": "Hushed",
  "😌": "Serenity",
  "😛": "Tongue",
  "😓": "Cold Sweat",
  "😔": "Mood Drop",
  "🪵": "Point at You",
  "💠": "Skull",
  "🐩": "Poop",
  "👌": "Okay",
  "🤌": "Chef Kiss",
  "🫶": "Heart Hands",
  "💅": "Sassy",
  "🖕🏻": "Rage",
  "🖕": "Rage",
  "🫂": "People Hug",
  "🙂‍↕️": "Nod",
  "🙂‍↔️": "Shake Head",
  "🌚": "Dark Moon",
  "😹": "Cat Laugh",
  "😻": "Cat Heart Eyes",
  "😼": "Cat Wry Smile",
  "😽": "Cat Kiss",
  "🙀": "Cat Scared",
  "😿": "Cat Crying",
  "😾": "Cat Angry",
  "🐱": "Cat Face",
  // ── Generic: Smileys ──
  "😃": "Happy",
  "😄": "Big Grin",
  "🤣": "ROFL",
  "😊": "Blush",
  "😋": "Yummy",
  "🤩": "Star-Struck",
  "🤔": "Thinking",
  "🤨": "Raised Brow",
  "😐": "Neutral",
  "😑": "Expressionless",
  "😶": "Mute",
  "😪": "Sleepy",
  "😫": "Tired",
  "😜": "Winking Tongue",
  "😝": "Squinting Tongue",
  "🤤": "Drooling",
  "😒": "Unamused",
  "😕": "Confused",
  "🙃": "Upside Down",
  "🤑": "Money Face",
  "😲": "Astonished",
  "🙁": "Slightly Sad",
  "☹️": "Frowning",
  "😖": "Confounded",
  "😞": "Disappointed",
  "😟": "Worried",
  "😤": "Huffing",
  "😢": "Crying",
  "😭": "Sobbing",
  "😦": "Frowning Open",
  "😧": "Anguished",
  "😨": "Fearful",
  "😩": "Weary",
  "🤯": "Exploding Head",
  "😬": "Grimacing",
  "😰": "Anxious",
  "😱": "Screaming",
  "🥵": "Hot Face",
  "🥶": "Cold Face",
  "😳": "Flushed",
  "🤪": "Zany",
  "😵": "Dizzy",
  "😵‍💫": "Spiral Eyes",
  "🥴": "Woozy",
  "😠": "Angry",
  "😡": "Pouting",
  "🤬": "Cursing",
  "😈": "Devil",
  "👿": "Imp",
  "🫠": "Melting",
  "🫡": "Salute",
  "🤭": "Giggle",
  "🤫": "Shush",
  "🫣": "Peeking",
  "🥹": "Holding Tears",
  "🫥": "Invisible",
  "🤥": "Liar",
  "🤧": "Sneezing",
  "🤮": "Vomiting",
  "🤒": "Sick",
  "😷": "Mask",
  "🤓": "Nerd",
  "🥸": "Disguise",
  // ── Generic: Gestures ──
  "👍": "Thumbs Up",
  "👎": "Thumbs Down",
  "👊": "Fist Bump",
  "✊": "Raised Fist",
  "🤛": "Left Fist",
  "🤜": "Right Fist",
  "👏": "Clapping",
  "🙌": "Raised Hands",
  "👐": "Open Hands",
  "🤲": "Palms Up",
  "🤝": "Handshake",
  "🙏": "Pray",
  "✌️": "Victory",
  "🤞": "Crossed Fingers",
  "🤟": "Love You",
  "🤘": "Rock On",
  "👈": "Point Left",
  "👉": "Point Right",
  "👆": "Point Up",
  "👇": "Point Down",
  "☝️": "Index Up",
  "✋": "Stop",
  "👋": "Wave",
  "💪": "Flex",
  "🖖": "Vulcan",
  // ── Generic: Hearts & Symbols ──
  "🧡": "Orange Heart",
  "💛": "Yellow Heart",
  "💚": "Green Heart",
  "💙": "Blue Heart",
  "💜": "Purple Heart",
  "🖤": "Black Heart",
  "🤍": "White Heart",
  "🤎": "Brown Heart",
  "💔": "Broken Heart",
  "❣️": "Heart Exclaim",
  "💯": "Hundred",
  "🔥": "Fire",
  "⭐": "Star",
  "💫": "Dizzy Star",
  "✨": "Sparkles",
  "💥": "Collision",
  "💨": "Dash",
  "🎉": "Party",
  "🎊": "Confetti",
  // ── Generic: Animals ──
  "🐶": "Dog",
  "🐭": "Mouse",
  "🐹": "Hamster",
  "🐰": "Bunny",
  "🦊": "Fox",
  "🐻": "Bear",
  "🐼": "Panda",
  "🐨": "Koala",
  "🐯": "Tiger",
  "🦁": "Lion",
  "🐮": "Cow",
  "🐷": "Pig",
  "🐸": "Frog",
  "🐵": "Monkey",
  "🙉": "Hear No Evil",
  "🙊": "Speak No Evil",
  "🐔": "Chicken",
  "🐧": "Penguin",
  "🦅": "Eagle",
  "🦉": "Owl",
  "🐺": "Wolf",
  "🐴": "Horse",
  "🦄": "Unicorn",
  "🐝": "Bee",
  "🦋": "Butterfly",
  "🐌": "Snail",
  "🐞": "Ladybug",
  "🐍": "Snake",
  // ── Generic: Food & Drink ──
  "🍕": "Pizza",
  "🍔": "Burger",
  "🍟": "Fries",
  "🎂": "Cake",
  "🍩": "Donut",
  "🍺": "Beer",
  "🥂": "Cheers",
  "☕": "Coffee",
  // ── Generic: Spooky & Special ──
  "💀": "Skull",
  "👻": "Ghost",
  "👽": "Alien",
  "🤖": "Robot",
  "💩": "Poop",
  "🎃": "Pumpkin",
  // ── Generic: Misc Popular ──
  "🏆": "Trophy",
  "🥇": "Gold Medal",
  "🎮": "Gaming",
  "🎵": "Music Note",
  "🎶": "Music Notes",
  "🌹": "Rose",
  "🌸": "Blossom",
  "💎": "Gem",
  "👑": "Crown",
  "🎁": "Gift",
  "🚀": "Rocket",
  "🌈": "Rainbow",
  "🌙": "Moon",
  "❄️": "Snowflake",
  "🎈": "Balloon",
  "🎯": "Bullseye",
  "⚽": "Soccer",
  "🏀": "Basketball",
  "💐": "Bouquet",
  "🕊️": "Dove",
  "🍀": "Clover",
  "🌻": "Sunflower",
};

const EmojiAnimationPicker = ({ open, onClose, onSelect }) => {
  const [search, setSearch] = useState("");

  // Deduplicate emojis that map to the same animation type
  const emojiList = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const emoji of Object.keys(EMOJI_MAP)) {
      const type = EMOJI_MAP[emoji];
      if (!seen.has(type)) {
        seen.add(type);
        list.push({ emoji, type, label: EMOJI_LABELS[emoji] || type });
      }
    }
    return list;
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return emojiList;
    const q = search.toLowerCase();
    return emojiList.filter(
      (e) =>
        e.emoji.includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
    );
  }, [emojiList, search]);

  const handleSelect = (emoji) => {
    if (onSelect) onSelect(emoji);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "rgba(30, 30, 40, 0.97)",
          backdropFilter: "blur(12px)",
          maxHeight: "55vh",
          maxWidth: "360px",
          width: "90vw",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          pt: 1.5,
          px: 2,
          color: "#fff",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          🎬 Emoji Animations
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#aaa" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Search */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search animations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#888" }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "#fff",
              "& fieldset": { border: "none" },
            },
          }}
        />
      </Box>

      {/* Emoji Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
          gap: 0.5,
          px: 1.5,
          pb: 1.5,
          pt: 0.5,
          overflowY: "auto",
          maxHeight: "38vh",
        }}
      >
        {filtered.map(({ emoji, label }) => (
          <Tooltip key={emoji} title={label} arrow placement="top">
            <Box
              onClick={() => handleSelect(emoji)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                p: 1,
                borderRadius: "12px",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.12)",
                  transform: "scale(1.15)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <Typography sx={{ fontSize: "1.6rem", lineHeight: 1 }}>
                {emoji}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#aaa",
                  mt: 0.3,
                  fontSize: "0.55rem",
                  textAlign: "center",
                  lineHeight: 1.2,
                  maxWidth: "60px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Typography>
            </Box>
          </Tooltip>
        ))}

        {filtered.length === 0 && (
          <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#666" }}>
              No animations found for "{search}"
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default EmojiAnimationPicker;
