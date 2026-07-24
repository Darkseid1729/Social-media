# Social Media Chat Application Guide

This guide is intentionally large and split into parts. Each part focuses on one layer of the project so you can read in order or jump to the piece you need. This is Part 1.

## Part 1 - Orientation and Top-Level Map

### 1) How to use this guide

- Read Part 1 first to get the big picture and the map of the repo.
- Later parts go deeper into client code, server code, realtime events, data models, and AI features.
- Each section explains not just what a file is, but why it exists and how it fits the flow.

Planned parts (I will write them one by one):

- Part 2: Client architecture (React app structure, routing, state, sockets)
- Part 3: Server architecture (Express API, Socket.IO, middleware, utils)
- Part 4: Realtime flows (Socket events, call flows, watch parties)
- Part 5: Data layer (MongoDB models and how they are used)
- Part 6: Feature deep dives (bot, audio calls, media, admin)
- Part 7: Deployment and production concerns

### 2) Project summary in plain words

This is a full-stack, realtime chat and social app. It has:

- A React single-page app (the client) that renders the UI and handles user interactions.
- An Express + Socket.IO server that provides REST APIs and realtime events.
- MongoDB for data storage.
- Third-party services for media, AI, GIFs, YouTube, and voice calls.

The user experience is closer to a modern chat app than a basic CRUD app: realtime messaging, presence, typing, audio calls, stickers, GIFs, watch parties, and an AI companion.

### 3) Architecture overview (high-level)

At the highest level, the flow looks like this:

1) The React client renders the UI and calls the server with HTTP for standard operations (login, fetch chats, update profile, etc.).
2) The same client also keeps a Socket.IO connection for realtime updates (new messages, typing indicators, read receipts, voice call signaling, watch party sync).
3) The server handles both REST routes and Socket.IO events, and persists everything in MongoDB.
4) Cloud services handle heavy tasks:
   - Cloudinary stores media and returns optimized URLs.
   - Giphy / Tenor provide GIFs.
   - YouTube Data API provides videos and music search.
   - Groq / OpenAI power the AI bot and animation generation.
   - Metered TURN helps voice calls work behind NATs.

You can think of the system as two big processes that always run together:

- The REST API for reliable, request/response work.
- The realtime socket channel for anything that should update instantly.

### 4) Workspace structure (root map)

Top-level items in the repository:

- [botpersonality.txt](botpersonality.txt)
- [package.json](package.json)
- [README.md](README.md)
- [Social-media-client/](Social-media-client/)
- [Social-media-server/](Social-media-server/)

Below is what each of those means and why it exists.

#### 4.1) botpersonality.txt

This file defines the prompt and rules for the AI bot persona ("Joon"). The server reads this file and uses it to shape the style of the bot responses. It includes:

- Identity and backstory (age, location, interests).
- Style rules (short responses, no narration, casual texting style).
- Safety rules and formatting constraints (no bot name prefix, limited emoji use).
- Example responses.

Why it matters: the bot is not just a generic AI; its personality is configured by this file. Changing the personality here changes how the bot sounds everywhere in the app.

#### 4.2) Root package.json

This file exists at the repo root, but it is not the main place you run scripts. It currently only defines a dependency and no scripts. In practice, you run the client and server from their own folders.

Why it matters: if you ever want to add repo-wide scripts (for example, run both client and server together), this is where they would live.

#### 4.3) Root README.md

This is the high-level public readme. It lists the feature set, architecture, and a broad project structure tree. This guide expands and explains those details in depth.

### 5) The two main apps

This project is really two apps living side by side.

#### 5.1) Social-media-client (React frontend)

Folder: [Social-media-client/](Social-media-client/)

What it contains:

- The Vite-powered React app and all UI code.
- A Socket.IO client to receive realtime events.
- Redux Toolkit and RTK Query for state and API data.
- Components for chat, calls, media, admin, and AI features.

Why it matters: this is everything the user sees and interacts with. It is also the main place where realtime events are interpreted and rendered.

#### 5.2) Social-media-server (Node.js backend)

Folder: [Social-media-server/](Social-media-server/)

What it contains:

- Express routes for REST APIs.
- Socket.IO server for realtime signaling and chat events.
- MongoDB models and DB logic.
- AI bot logic and integrations.

Why it matters: this is the source of truth for data, auth, and realtime messaging.

### 6) How to run locally (quick start)

This is a simple, minimal local setup flow. Full environment variables and deep setup details will be in later parts.

1) Install server dependencies

- Open a terminal in [Social-media-server/](Social-media-server/)
- Run: npm install

2) Install client dependencies

- Open a terminal in [Social-media-client/](Social-media-client/)
- Run: npm install

3) Configure environment variables (basics)

- The server expects a .env file in [Social-media-server/](Social-media-server/).
- The client expects a .env file in [Social-media-client/](Social-media-client/).
- At minimum, the client needs a server URL to call (for example, VITE_SERVER).
- The server needs keys for MongoDB, JWT, and external services.

4) Run the server

- From [Social-media-server/](Social-media-server/): npm run dev

5) Run the client

- From [Social-media-client/](Social-media-client/): npm run dev

Note: The client and server run as separate processes. This is normal for modern full-stack apps.

### 7) Client package.json (scripts and intent)

File: [Social-media-client/package.json](Social-media-client/package.json)

Scripts:

- dev: starts the Vite dev server
- build: produces a production build
- lint: runs ESLint
- preview: serves the built app locally
- vercel-build: a Vercel-specific build command

Why it matters: this is the official way to run and build the frontend.

### 8) Server package.json (scripts and intent)

File: [Social-media-server/package.json](Social-media-server/package.json)

Scripts:

- start: runs the server with Node
- dev: runs the server with Nodemon for automatic reload

Why it matters: this is the official way to run and debug the backend locally.

### 9) First look at the main entry points

This section introduces the entry files you will see in later parts.

#### 9.1) Client entry files

- [Social-media-client/index.html](Social-media-client/index.html) is the HTML shell for the SPA.
- [Social-media-client/src/main.jsx](Social-media-client/src/main.jsx) boots React and providers.
- [Social-media-client/src/App.jsx](Social-media-client/src/App.jsx) wires routing and top-level layout.
- [Social-media-client/src/socket.jsx](Social-media-client/src/socket.jsx) holds the Socket.IO setup.

Why it matters: these files are the backbone of the frontend. Almost every UI flow connects to them.

#### 9.2) Server entry file

- [Social-media-server/app.js](Social-media-server/app.js) creates the Express app, Socket.IO server, routes, and realtime handlers.

Why it matters: app.js is the heart of the backend. It is where REST and realtime are connected.

### 10) What will be explained in the next part

Part 2 will go inside the client and explain:

- How routing works (public, auth, admin)
- How Redux slices and RTK Query are organized
- How Socket.IO events are handled in the UI
- The structure of components: dialogs, layout, shared, specific
- How the music player, emoji animations, and watch parties are wired in the UI

If you want me to start with a different part first, tell me and I will reorder the guide.
