<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4.7-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/WebRTC-Audio_Calls-333333?style=for-the-badge&logo=webrtc&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

# 💬 Social Media Chat Application

A **feature-rich, real-time chat application** built with the MERN stack, Socket.IO, and WebRTC. Includes one-on-one & group messaging, voice calls with voice effects, an AI chatbot companion, YouTube watch parties, GIF & sticker sharing, a built-in music player, and a full admin dashboard — all wrapped in a beautiful, themeable UI.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Socket.IO Events](#-socketio-events)
- [Database Models](#-database-models)
- [Client State Management](#-client-state-management)
- [Theming System](#-theming-system)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 💬 Core Messaging
- **Real-time messaging** via Socket.IO with WebSocket transport
- **One-on-one chats** and **group chats** with member management
- **Message attachments** — images, videos, audio, documents (up to 15 MB each, 10 files per message)
- **Message replies** — reply to specific messages with context preview
- **Message forwarding** — forward messages across chats
- **Message reactions** — react with 👍 ❤️ 😂 😮 😢 😡
- **Message search** — full-text search within chat conversations
- **Message deletion** — soft delete with "unsend" behavior
- **Read receipts** — real-time "seen" indicators with `ChatReadState` tracking
- **Typing indicators** — see when the other person is typing
- **Online presence** — real-time online/offline status with last-seen timestamps
- **Link previews** — automatic URL detection and rich preview rendering
- **Cloudinary image optimization** — automatic format, quality, and DPR-aware transforms

### 📞 Voice Calls (WebRTC)
- **1-on-1 and group audio calls** via peer-to-peer WebRTC mesh
- **TURN/STUN server support** — Metered.ca TURN credentials fetched server-side (API key never exposed to client)
- **Voice effects** — 8 real-time voice modifiers powered by Web Audio API:
  - Normal, Robot, Deep, Echo, Phone, Alien, Female, Male, Baby
- **Formant-preserving pitch shifting** via custom `AudioWorkletProcessor` (servo-stabilised OLA)
- **Dynamics compressor** — automatic volume levelling on all calls
- **SDP patching** — OPUS codec prioritisation & 32 kbps bandwidth cap for mobile reliability
- **Speaker/earpiece toggle** with Bluetooth routing detection
- **Call history** — stored in MongoDB with duration, status (answered/missed/rejected)
- **Disconnect grace period** — 15-second reconnection window before call ends
- **Call rejoin** — automatic rejoin on reconnect (CHECK_ACTIVE_CALL)

### 🤖 AI Chatbot — "Joon"
- **AI-powered companion** with configurable personality (loaded from `botpersonality.txt`)
- **Groq API** with Llama 3.3 70B model (dual API key rotation on rate limit)
- **OpenAI GPT-4o** fallback for AI animation generation
- **Intelligent message buffering** — batches rapid-fire messages before responding
- **Context-aware** — reads last 15 messages for conversational continuity
- **GIF-aware** — detects Giphy URLs, fetches metadata, and reacts to GIF content contextually
- **Bot can send GIFs** — responds with `[GIF:term]` syntax → Giphy API search
- **Realistic typing simulation** — typing indicator + delay based on response length
- **Multi-message splitting** — bot can send multiple sequential messages separated by `|||`
- **Auto-accept friend requests** — sending a friend request to Joon instantly creates a chat
- **Usage statistics** — per-user token/message tracking for the admin dashboard

### 🎨 AI Animation Generator
- **Text-to-HTML animation** — describe an animation and get a full self-contained HTML5 canvas creation
- **GPT-4o primary → Groq Llama fallback** pipeline
- Generates production-quality vanilla HTML/CSS/JS animations (no external libraries)

### 🎬 YouTube Watch Parties
- **Synchronised YouTube playback** across all chat members
- **Host-controlled** — play, pause, seek, change playback rate, change video
- **Real-time state sync** via server-authoritative position computation
- **Join/rejoin** — late joiners receive authoritative state snapshot
- **YouTube Search & Trending** — browse and search videos directly in-app (YouTube Data API v3)
- **Shorts filtering** — filter results for videos ≤60 seconds

### 🎵 Built-in Music Player
- **YouTube-powered audio playback** via hidden IFrame player
- **Search music** directly within the app (YouTube Search API)
- **Queue management** — add, remove, reorder songs
- **Playback controls** — play, pause, next, previous, seek, volume
- **Repeat & shuffle** modes
- **Mini player** — persistent mini player across all pages
- **Full player dialog** — expanded controls with queue view

### 🖼️ Rich Media Features
- **GIF picker** — search & send GIFs via Giphy API (Tenor fallback)
- **Sticker picker** — custom sticker packs hosted on Cloudinary
- **Emoji animations** — trigger full-screen emoji effects from a curated animation picker
- **Emoji combo detection** — when two users send the same emoji within 10 seconds, a special combo animation triggers
- **Message animations** — confetti and reveal effects on messages
- **Media gallery** — browse all shared photos/videos in a chat
- **Image lightbox** — full-screen image viewer with zoom
- **Video preview** — in-chat video playback
- **Custom chat wallpapers** — upload per-chat backgrounds (Cloudinary storage)

### 👤 User System
- **Registration** with avatar upload (Cloudinary)
- **JWT authentication** — HTTP-only cookies with `SameSite=None` for cross-origin
- **Bcrypt password hashing** (10 rounds)
- **Login brute-force protection** — 5 attempts max, 15-minute lockout
- **Profile management** — update avatar, view profile
- **Friend system** — search users (exact username match), send/accept/reject friend requests
- **User profile dialog** — view another user's public info, friend status
- **FCM push notifications** — Firebase Cloud Messaging for offline users (Android/iOS ready)

### 🛡️ Admin Dashboard
- **Admin authentication** — separate admin login with secret key
- **Dashboard** — overview charts and analytics (Chart.js)
- **User management** — view all users with MUI DataGrid
- **Chat management** — view all chats (1-on-1 and groups)
- **Message management** — browse and monitor all messages
- **Bot management** — view bot usage statistics, per-user analytics, conversation logs, token usage

### 🎨 Theming
- **6 built-in themes**: Dark, Light, Pink, Pink Dark, Blue, Blue Dark
- **30+ design tokens** per theme — colors, gradients, overlays, text styles
- **Context-based** — `ThemeContext` + `NotificationSoundContext`
- **Notification sounds** — configurable notification audio

### 📱 Mobile Optimized
- **Responsive layout** — works on all screen sizes
- **Mobile-first socket configuration** — WebSocket + polling transport with reconnection
- **Service worker** — registered for caching
- **PWA metadata** — `apple-mobile-web-app-capable` configured
- **Right-click disabled** — `onContextMenu` prevention for app-like feel
- **Capacitor-ready** — CORS configured for `capacitor://localhost`

---

## 🛠️ Tech Stack

### Frontend (Client)

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2 | UI library (SPA) |
| **Vite** | 5.1 | Build tool & dev server (with SWC plugin for fast refresh) |
| **Redux Toolkit** | 2.2 | Global state management |
| **RTK Query** | (bundled) | Data fetching, caching, and server state |
| **React Router DOM** | 6.22 | Client-side routing with lazy loading |
| **Socket.IO Client** | 4.7 | Real-time WebSocket communication |
| **Material UI (MUI)** | 5.15 | Component library (buttons, dialogs, grids, icons) |
| **MUI Icons** | 5.15 | Icon system |
| **MUI X DataGrid** | 6.19 | Admin dashboard data tables |
| **Emotion** | 11.11 | CSS-in-JS (MUI's styling engine) |
| **Framer Motion** | 11.0 | Animations and page transitions |
| **Chart.js** | 4.4 | Admin dashboard analytics charts |
| **react-chartjs-2** | 5.2 | React wrapper for Chart.js |
| **Axios** | 1.6 | HTTP client for API requests |
| **React Hot Toast** | 2.4 | Toast notification system |
| **React Helmet Async** | 2.0 | SEO and document head management |
| **Moment.js** | 2.30 | Date/time formatting and manipulation |
| **moment-timezone** | 0.6 | Timezone-aware date handling |
| **6pp** | 1.1 | Custom hooks utility library |
| **react-swipeable-views** | 0.14 | Swipeable tab/page views |
| **ESLint** | 8.56 | Code linting |

### Backend (Server)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | — | Runtime environment |
| **Express** | 4.18 | HTTP framework and REST API |
| **Socket.IO** | 4.7 | Real-time bidirectional communication |
| **Mongoose** | 8.2 | MongoDB ODM (schemas, indexes, queries) |
| **MongoDB Atlas** | — | Cloud database (with retry logic, connection pooling) |
| **Cloudinary** | 2.0 | Image/video/file cloud storage and CDN |
| **JSON Web Token** | 9.0 | Authentication (JWT in HTTP-only cookies) |
| **Bcrypt** | 5.1 | Password hashing |
| **Multer** | 1.4 | Multipart file upload parsing (15 MB limit) |
| **CORS** | 2.8 | Cross-origin resource sharing |
| **Cookie Parser** | 1.4 | Cookie parsing middleware |
| **dotenv** | 16.4 | Environment variable management |
| **UUID** | 9.0 | Unique ID generation (call IDs, file names) |
| **Express Validator** | 7.0 | Request body/param validation |
| **Groq SDK** | 0.36 | Groq API client (Llama 3.3 70B for the chatbot) |
| **OpenAI SDK** | 6.27 | OpenAI GPT-4o for AI animation generation |
| **Firebase Admin** | 13.7 | Firebase Cloud Messaging (push notifications) |
| **Axios** | 1.12 | HTTP client (YouTube API, GIF APIs, TURN credentials) |
| **Nodemon** | 3.1 | Dev server auto-restart |
| **Faker.js** | 8.4 | Dev-only fake data generation for seeding |

### External Services & APIs

| Service | Usage |
|---|---|
| **MongoDB Atlas** | Primary database |
| **Cloudinary** | Media storage, CDN, and image transformations |
| **Groq Cloud** | AI chatbot (Llama 3.3 70B) — dual API key rotation |
| **OpenAI** | GPT-4o for HTML animation generation |
| **Firebase Cloud Messaging** | Push notifications for offline users |
| **Giphy API** | GIF search and trending |
| **Tenor API** | GIF search fallback |
| **YouTube Data API v3** | Video search, trending, and metadata |
| **Metered.ca** | TURN/STUN relay servers for WebRTC calls |
| **Vercel** | Frontend deployment (SPA with rewrites) |

---

## 📂 Project Structure

```
Social-media/
├── botpersonality.txt              # AI chatbot (Joon) personality prompt
├── package.json                    # Root workspace
├── .gitignore
│
├── Social-media-client/            # ⚛️ React Frontend
│   ├── index.html                  # SPA entry point
│   ├── package.json
│   ├── vite.config.js              # Vite + React SWC plugin
│   ├── vercel.json                 # Vercel SPA rewrite rules
│   ├── .eslintrc.cjs               # ESLint configuration
│   ├── .env                        # VITE_SERVER URL
│   ├── public/                     # Static assets (sw.js, etc.)
│   ├── scripts/                    # Build scripts (sticker manifest generators)
│   └── src/
│       ├── main.jsx                # App entry — Provider wrappers
│       ├── App.jsx                 # Router, lazy loading, auth check
│       ├── socket.jsx              # Socket.IO context provider
│       ├── assets/                 # Sticker manifests, notes
│       ├── components/
│       │   ├── auth/               # ProtectRoute (route guards)
│       │   ├── comboAnimations/    # Emoji combo animation system (100+ configs)
│       │   ├── dialogs/            # 22 dialog components
│       │   │   ├── AudioCallDialog.jsx
│       │   │   ├── WatchPartyDialog.jsx
│       │   │   ├── GifPicker.jsx
│       │   │   ├── StickerPicker.jsx
│       │   │   ├── EmojiAnimationPicker.jsx
│       │   │   ├── AiAnimationDialog.jsx
│       │   │   ├── GiftCardDialog.jsx
│       │   │   ├── MediaGallery.jsx
│       │   │   ├── MediaViewer.jsx
│       │   │   ├── YouTubeSearchDialog.jsx
│       │   │   ├── CallHistoryDialog.jsx
│       │   │   ├── ForwardDialog.jsx
│       │   │   ├── SearchMessagesDialog.jsx
│       │   │   ├── WallpaperDialog.jsx
│       │   │   ├── ProfileViewDialog.jsx
│       │   │   ├── TranslateMessageDialog.jsx
│       │   │   └── ...
│       │   ├── layout/             # AppLayout, Header, AdminLayout, Loaders
│       │   ├── music/              # MiniMusicPlayer, MusicPlayerDialog, MusicSearchDialog
│       │   ├── shared/             # Reusable components (20 components)
│       │   │   ├── MessageComponent.jsx  # Main message renderer
│       │   │   ├── ChatItem.jsx
│       │   │   ├── LinkPreview.jsx
│       │   │   ├── YouTubePlayer.jsx
│       │   │   ├── ImageGrid.jsx
│       │   │   ├── ReactionPicker.jsx
│       │   │   ├── ReplyDisplay.jsx
│       │   │   └── ...
│       │   ├── specific/           # Feature-specific components
│       │   │   ├── ChatList.jsx
│       │   │   ├── Search.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Notifications.jsx
│       │   │   ├── NewGroup.jsx
│       │   │   ├── GroupMembersList.jsx
│       │   │   └── Charts.jsx
│       │   └── styles/             # Styled components
│       ├── constants/
│       │   ├── config.js           # Server URL
│       │   ├── events.js           # Socket event names
│       │   ├── themes.js           # 6 theme definitions (30+ tokens each)
│       │   └── sampleData.js       # Dev sample data
│       ├── context/
│       │   ├── ThemeContext.jsx
│       │   ├── MusicPlayerContext.jsx
│       │   └── NotificationSoundContext.jsx
│       ├── hooks/
│       │   ├── hook.jsx            # Custom hooks (useErrors, useAsyncMutation)
│       │   ├── useAudioCall.js     # Full WebRTC audio call hook (1000+ lines)
│       │   ├── useWatchParty.js    # Watch party sync hook
│       │   ├── useNotificationSound.js
│       │   └── usePageVisibility.js
│       ├── lib/
│       │   └── features.js         # Utility functions (file format, Cloudinary transforms)
│       ├── pages/
│       │   ├── Chat.jsx            # Main chat page (49 KB)
│       │   ├── Login.jsx           # Login/Register page
│       │   ├── Welcome.jsx
│       │   ├── Home.jsx
│       │   ├── Groups.jsx          # Group management
│       │   ├── BotAdmin.jsx        # Bot admin panel
│       │   ├── NotFound.jsx
│       │   └── admin/
│       │       ├── AdminLogin.jsx
│       │       ├── Dashboard.jsx
│       │       ├── UserManagement.jsx
│       │       ├── ChatManagement.jsx
│       │       ├── MessageManagement.jsx
│       │       └── BotManagement.jsx
│       ├── redux/
│       │   ├── store.js            # Redux store configuration
│       │   ├── api/
│       │   │   └── api.js          # RTK Query API slice (33 endpoints)
│       │   ├── reducers/
│       │   │   ├── auth.js
│       │   │   ├── chat.js
│       │   │   └── misc.js
│       │   └── thunks/
│       │       └── admin.js
│       └── utils/
│           ├── emojiEffect.js      # Emoji particle effects
│           ├── linkUtils.js        # URL detection and parsing
│           ├── timeUtils.js        # Time formatting
│           ├── translation.js      # Message translation
│           └── validators.js       # Input validation
│
└── Social-media-server/            # 🖥️ Node.js Backend
    ├── app.js                      # Main server (1100 lines) — Express, Socket.IO, all event handlers
    ├── package.json
    ├── .env                        # Environment variables
    ├── constants/
    │   ├── config.js               # CORS options, token name
    │   └── events.js               # 30+ socket event constants
    ├── controllers/
    │   ├── user.js                 # Auth, profile, friends, FCM tokens
    │   ├── chat.js                 # Chats, messages, attachments, reactions, calls, TURN creds
    │   ├── admin.js                # Admin dashboard data
    │   ├── bot.js                  # AI chatbot (Joon) — buffering, Groq/OpenAI, GIF reactions
    │   ├── gif.js                  # Giphy + Tenor GIF search
    │   ├── youtube.js              # YouTube trending + search
    │   └── avatar.js               # Avatar update
    ├── middlewares/
    │   ├── auth.js                 # JWT auth, admin auth, socket auth
    │   ├── error.js                # Error handling middleware
    │   └── multer.js               # File upload (15 MB, 10 files max)
    ├── models/
    │   ├── user.js                 # User schema (bcrypt pre-save, FCM tokens, text indexes)
    │   ├── chat.js                 # Chat schema (group/1-on-1, wallpaper, text index)
    │   ├── message.js              # Message schema (reactions, replies, forwards, soft delete)
    │   ├── request.js              # Friend request schema
    │   ├── callRecord.js           # Call history schema (duration, participants)
    │   └── chatReadState.js        # Read receipt pointers
    ├── routes/
    │   ├── user.js                 # User routes (auth, profile, friends, FCM)
    │   ├── chat.js                 # Chat routes (CRUD, messages, reactions, calls, TURN)
    │   ├── admin.js                # Admin routes
    │   ├── bot.js                  # Bot routes (chat, stats, history, animation)
    │   ├── gif.js                  # GIF routes (trending, search)
    │   └── youtube.js              # YouTube routes (trending, search)
    ├── lib/
    │   ├── helper.js               # getSockets, getOtherMember
    │   └── validators.js           # Express-validator rules
    ├── utils/
    │   ├── features.js             # DB connect (retry), JWT token, Cloudinary upload, emitEvent
    │   ├── firebase.js             # Firebase Admin SDK, push notifications
    │   ├── utility.js              # ErrorHandler class
    │   ├── userLoginAttempts.js    # In-memory login attempt tracker
    │   └── adminLoginAttempts.js   # In-memory admin login attempt tracker
    ├── seeders/
    │   ├── bot.js                  # Create/fetch bot user "Joon"
    │   ├── user.js                 # Seed users (Faker)
    │   └── chat.js                 # Seed chats (Faker)
    └── scripts/
        └── generateCloudinaryStickerManifest.cjs
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React SPA)                       │
│  Vite • React 18 • Redux Toolkit • RTK Query • Socket.IO Client│
│  MUI • Framer Motion • Chart.js • Web Audio API • WebRTC       │
└───────────────────────┬─────────────────────────────────────────┘
                        │  REST API (Axios)  &  WebSocket (Socket.IO)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Server (Node.js + Express)                  │
│  Express REST API • Socket.IO Server • JWT Auth • Multer        │
│  Groq/OpenAI SDK • Firebase Admin • Express Validator           │
├────────────┬──────────────┬──────────────┬──────────────────────┤
│  MongoDB   │  Cloudinary  │  Giphy/Tenor │  YouTube Data API    │
│  Atlas     │  (Media CDN) │  (GIFs)      │  (Videos/Music)      │
├────────────┴──────────────┴──────────────┴──────────────────────┤
│  Groq Cloud (Llama 3.3)  •  OpenAI (GPT-4o)  •  Firebase FCM   │
│  Metered.ca (TURN/STUN)                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB Atlas** cluster (or local MongoDB)
- **Cloudinary** account
- API keys for Groq, Giphy, YouTube (optional for full features)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Social-media.git
cd Social-media

# Install server dependencies
cd Social-media-server
npm install

# Install client dependencies
cd ../Social-media-client
npm install --legacy-peer-deps
```

### Running Locally

```bash
# Terminal 1 — Start the server (with auto-restart)
cd Social-media-server
npm run dev          # Uses nodemon → watches for file changes

# Terminal 2 — Start the client
cd Social-media-client
npm run dev          # Vite dev server → http://localhost:5173
```

### Production Build

```bash
cd Social-media-client
npm run build        # Outputs to dist/
npm run preview      # Preview production build locally
```

---

## 🔐 Environment Variables

### Server (`Social-media-server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `DEVELOPMENT` or `PRODUCTION` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `ADMIN_SECRET_KEY` | Secret key for admin panel login |
| `CLIENT_URL` | Frontend URL for CORS (e.g., `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GROQ_API_KEY` | Primary Groq API key (Llama 3.3 chatbot) |
| `GROQ_API_KEY2` | Secondary Groq API key (rate limit failover) |
| `GPT_API_KEY` | OpenAI API key (animation generation) |
| `GIPHY_API_KEY` | Giphy API key |
| `TENOR_API_KEY` | Tenor API key (GIF fallback) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `TURN_METERED_URL` | Metered.ca TURN credentials endpoint |
| `TURN_METERED_URL2` | Backup TURN credentials endpoint |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (push notifications) |

### Client (`Social-media-client/.env`)

| Variable | Description |
|---|---|
| `VITE_SERVER` | Backend server URL (e.g., `http://localhost:5000`) |

---

## 🔌 API Routes

### User Routes (`/api/v1/user`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/new` | ✗ | Register new user (with avatar upload) |
| `POST` | `/login` | ✗ | Login (rate limited — 5 attempts, 15-min lockout) |
| `GET` | `/me` | ✓ | Get current user profile |
| `GET` | `/logout` | ✓ | Logout (clear cookie) |
| `PUT` | `/avatar` | ✓ | Update user avatar |
| `GET` | `/search` | ✓ | Search users by exact username |
| `GET` | `/notifications` | ✓ | Get pending friend requests |
| `GET` | `/friends` | ✓ | Get friend list |
| `GET` | `/friend-status/:userId` | ✓ | Check friend status with a user |
| `GET` | `/:id` | ✓ | Get another user's public profile |
| `PUT` | `/sendrequest` | ✓ | Send friend request (auto-accepts for bot) |
| `PUT` | `/acceptrequest` | ✓ | Accept/reject friend request |
| `PUT` | `/fcm-token` | ✓ | Save FCM token for push notifications |
| `DELETE` | `/fcm-token` | ✓ | Remove FCM token on logout |

### Chat Routes (`/api/v1/chat`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/new` | ✓ | Create new group chat |
| `GET` | `/my` | ✓ | Get user's chats |
| `GET` | `/my/groups` | ✓ | Get user's groups |
| `PUT` | `/addmembers` | ✓ | Add members to group |
| `PUT` | `/removemember` | ✓ | Remove member from group |
| `DELETE` | `/leave/:id` | ✓ | Leave a group |
| `POST` | `/message` | ✓ | Send attachments (multipart) |
| `GET` | `/message/:id` | ✓ | Get messages (paginated) |
| `GET` | `/messages/:chatId/around/:messageId` | ✓ | Get messages around a specific message (jump-to) |
| `GET` | `/messages/:chatId/more` | ✓ | Load older/newer messages from timestamp |
| `GET` | `/search/:id` | ✓ | Search messages in a chat |
| `GET` | `/media/:id` | ✓ | Get chat media gallery |
| `GET` | `/calls/:id` | ✓ | Get call history for a chat |
| `GET` | `/turn-credentials` | ✓ | Get TURN server credentials (proxied) |
| `GET` | `/:id` | ✓ | Get chat details |
| `PUT` | `/:id` | ✓ | Rename group |
| `DELETE` | `/:id` | ✓ | Delete chat |
| `PUT` | `/wallpaper` | ✗ | Set chat wallpaper |
| `POST` | `/reaction/add` | ✓ | Add message reaction |
| `POST` | `/reaction/remove` | ✓ | Remove message reaction |
| `POST` | `/forward` | ✓ | Forward message to other chats |
| `DELETE` | `/message/:id` | ✓ | Delete (unsend) a message |

### Bot Routes (`/api/v1/bot`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/chat` | ✓ | Send message to AI chatbot |
| `GET` | `/stats` | Admin | Get bot usage statistics |
| `GET` | `/history/:userId` | Admin | Get user's bot chat history |
| `POST` | `/animation` | ✓ | Generate AI HTML animation |

### GIF Routes (`/api/v1/gif`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/trending` | ✓ | Trending GIFs (Giphy → Tenor fallback) |
| `GET` | `/search` | ✓ | Search GIFs |

### YouTube Routes (`/api/v1/youtube`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/trending` | ✓ | Trending YouTube videos |
| `GET` | `/search` | ✓ | Search YouTube videos |

### Admin Routes (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/verify` | ✗ | Admin login |
| `GET` | `/logout` | Admin | Admin logout |
| `GET` | `/` | Admin | Admin dashboard data |
| `GET` | `/users` | Admin | All users |
| `GET` | `/chats` | Admin | All chats |
| `GET` | `/messages` | Admin | All messages |

---

## 📡 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `NEW_MESSAGE` | `{ chatId, members, message, replyTo, clientId }` | Send a text message |
| `START_TYPING` | `{ members, chatId }` | User started typing |
| `STOP_TYPING` | `{ members, chatId }` | User stopped typing |
| `EMOJI_EFFECT` | `{ members, chatId, emoji }` | Trigger emoji particle effect |
| `EMOJI_ANIMATION` | `{ members, chatId, emoji }` | Trigger emoji animation |
| `MESSAGE_ANIMATION` | `{ members, chatId, messageId, animation }` | Trigger message animation |
| `MESSAGE_READ` | `{ chatId, messageId }` | Mark message as read |
| `CHAT_JOINED` | `{ userId, members }` | User joined a chat view |
| `CHAT_LEAVED` | `{ userId, members }` | User left a chat view |
| `CALL_INITIATED` | `{ to, chatId, members, isGroup, groupName }` | Start a call |
| `CALL_ACCEPTED` | `{ callId }` | Accept incoming call |
| `CALL_REJECTED` | `{ callId }` | Reject incoming call |
| `CALL_ENDED` | `{ callId }` | End active call |
| `WEBRTC_OFFER` | `{ callId, offer, toUserId }` | Send WebRTC offer |
| `WEBRTC_ANSWER` | `{ callId, answer, toUserId }` | Send WebRTC answer |
| `WEBRTC_ICE_CANDIDATE` | `{ callId, candidate, toUserId }` | Send ICE candidate |
| `CHECK_ACTIVE_CALL` | — | Check if user has an active call to rejoin |
| `WATCH_PARTY_CREATE` | `{ chatId, videoId }` | Create watch party |
| `WATCH_PARTY_JOIN` | `{ chatId }` | Join existing watch party |
| `WATCH_PARTY_CONTROL` | `{ chatId, action, currentTime, ... }` | Control playback (play/pause/seek/rate/change-video) |
| `WATCH_PARTY_STATE_REQUEST` | `{ chatId }` | Request current party state |
| `WATCH_PARTY_END` | `{ chatId }` | End watch party (host only) |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `NEW_MESSAGE` | `{ chatId, message }` | New message in chat |
| `NEW_MESSAGE_ALERT` | `{ chatId, senderName, message, senderAvatar }` | New message notification |
| `EMOJI_COMBO` | `{ chatId, emoji, users }` | Emoji combo triggered |
| `MESSAGE_READ_UPDATE` | `{ chatId, userId, messageId, readAt }` | Read receipt update |
| `ONLINE_USERS` | `[userId, ...]` | Updated online user list |
| `CALL_INITIATED` | `{ callId, from, fromName, chatId, isGroup }` | Incoming call |
| `CALL_ACCEPTED` | `{ callId, userId, shouldCreateOffer }` | Call accepted |
| `CALL_REJECTED` | `{ callId }` | Call rejected |
| `CALL_ENDED` | `{ callId }` | Call ended |
| `CALL_REJOIN` | `{ callId, chatId, participants, callStartedAt }` | Rejoin after reconnect |
| `CALL_USER_DISCONNECTED` | `{ callId, userId }` | User temporarily disconnected |
| `CALL_USER_RECONNECTED` | `{ callId, userId, userName }` | User reconnected |
| `CALL_PARTICIPANTS` | `{ participants }` | Updated call participant list |
| `CALL_FAILED` | `{ reason }` | Call initiation failed |
| `CALL_ID` | `{ callId }` | Assigned call ID |
| `WATCH_PARTY_STATE_UPDATE` | `{ chatId, state, action }` | Watch party state sync |
| `WATCH_PARTY_ENDED` | `{ chatId, endedBy }` | Watch party ended |
| `WATCH_PARTY_ERROR` | `{ chatId, message }` | Watch party error |

---

## 🗃️ Database Models

### User
- `name`, `username` (unique), `bio`, `password` (hashed, select: false)
- `avatar` — `{ public_id, url }` (Cloudinary)
- `lastSeen` — updated on socket disconnect
- `fcmTokens[]` — `{ token, device, updatedAt }` for push notifications
- **Indexes**: username, text search (name + username + bio)

### Chat
- `name`, `groupChat` (boolean), `creator` (ref: User)
- `members[]` (ref: User)
- `wallpaper` — `{ public_id, url }` (Cloudinary)
- **Indexes**: text search (name)

### Message
- `content`, `sender` (ref: User), `chat` (ref: Chat)
- `attachments[]` — `{ public_id, url }`
- `reactions[]` — `{ user, emoji, createdAt }` (6 emoji options)
- `replyTo` — Mixed type (ObjectId or clientId string)
- `clientId` — client-generated UUID for optimistic updates
- `isForwarded`, `originalMessage` — forward tracking
- `deletedAt`, `deletedBy` — soft delete
- **Indexes**: `chat+createdAt`, `sender+createdAt`, text search (content)

### Request (Friend Request)
- `sender`, `receiver` (ref: User)
- `status` — `pending` | `accepted` | `rejected`

### CallRecord
- `callId` (unique), `chat`, `caller` (ref: User)
- `participants[]` — `{ user, joinedAt }`
- `isGroup`, `status` — `missed` | `rejected` | `answered` | `failed`
- `startedAt`, `answeredAt`, `endedAt`, `duration` (seconds)

### ChatReadState
- `chat`, `user` — compound unique index
- `lastReadMessageId`, `lastReadMessageAt`, `lastReadAt`

---

## 🧠 Client State Management

### Redux Slices

| Slice | Purpose |
|---|---|
| `auth` | User authentication state (user object, loader) |
| `chat` | Chat-specific state (notifications count, new messages alert) |
| `misc` | UI state (mobile drawer, search, notifications, groups dialogs) |

### RTK Query API (`api.js`)

33 auto-generated hooks for data fetching with caching, invalidation, and optimistic updates:

- `useMyChatsQuery`, `useChatDetailsQuery`, `useGetMessagesQuery`
- `useSendFriendRequestMutation`, `useAcceptFriendRequestMutation`
- `useSendAttachmentsMutation`, `useForwardMessageMutation`
- `useAddMessageReactionMutation`, `useRemoveMessageReactionMutation`
- `useDeleteMessageMutation`, `useDeleteChatMutation`
- `useGetUserProfileQuery`, `useCheckFriendStatusQuery`
- `useGetChatMediaQuery`, `useGetCallHistoryQuery`
- ... and more

### React Contexts

| Context | Purpose |
|---|---|
| `ThemeContext` | Active theme name + toggle |
| `MusicPlayerContext` | Global music player state (YouTube IFrame API) |
| `NotificationSoundContext` | Notification sound preferences |

---

## 🎨 Theming System

6 fully-defined themes with 30+ design tokens each:

| Theme | Accent Colors | Style |
|---|---|---|
| **Dark** | Cyan + Green | Dark gradient backgrounds |
| **Light** | Blue + Orange | Clean light mode |
| **Pink** | Pink + Magenta | Pastel pink |
| **Pink Dark** | Pink + Purple | Deep pink/purple gradients |
| **Blue** | Blue + White | Clean blue palette |
| **Blue Dark** | Light blue + Navy | Deep ocean blue |

Each theme defines: `PRIMARY_COLOR`, `APP_BG`, `SIDEBAR_BG`, `DIALOG_BG`, `CHAT_COLOR_BG`, `TEXT_PRIMARY`, `TEXT_SECONDARY`, `BUTTON_ACCENT`, `CHART_ACCENT`, `LINK_ACCENT`, `SENDER_NAME_COLOR`, `TIMEAGO_COLOR`, `FRIEND_NAME_COLOR`, and more.

---

## 🌐 Deployment

### Frontend — Vercel

The client is configured for Vercel with SPA rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Build Command**: `npm install --legacy-peer-deps && npm run build`

### Backend — Any Node.js Host

The server runs as a standard Node.js application:

```bash
npm start    # node app.js
```

**Required**: Set all environment variables. MongoDB Atlas must have the server IP whitelisted.

### CORS Configuration

Allowed origins:
- `http://localhost:5173` (dev)
- `https://social-media-adi.vercel.app` (production)
- `capacitor://localhost` (mobile app)
- Custom `CLIENT_URL` from env

---

## 🔒 Security Features

- **JWT in HTTP-only cookies** — tokens inaccessible to JavaScript (XSS resistant)
- **SameSite=None + Secure** — cross-origin cookie support for separate frontend/backend domains
- **Bcrypt** — 10-round password hashing
- **Login brute-force protection** — 5 attempts max, 15-minute lockout (per-user)
- **Admin separate auth** — dedicated admin token cookie
- **Socket authentication** — JWT verified on WebSocket connection (not just HTTP)
- **Express Validator** — request body validation on all inputs
- **TURN credentials proxied** — Metered API key never sent to client
- **File size limits** — 15 MB per file, 10 files per message (Multer)
- **Cloudinary signed uploads** — server-side upload with timestamp verification
- **Right-click disabled** — prevents casual content copying on frontend
- **FCM token cleanup** — automatically removes invalid/expired push notification tokens

---

## 📄 License

This project is for personal use.

---

<p align="center">
  Built with ❤️ using React, Node.js, MongoDB, Socket.IO & WebRTC
</p>
