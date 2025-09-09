const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "https://crispy-orbit-4j6g6jv7v4qx3jpw4-5173.app.github.dev",
    // "https://social-media-adi.vercel.app"
    // "http://localhost:5173",
    // Add other allowed origins here
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "my-social-media-token";

export { corsOptions, CHATTU_TOKEN };
