const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "https://social-media-adi.vercel.app",
    // "https://scaling-waddle-x5x9x5pwpj5x2697r-5173.app.github.dev",
    "capacitor://localhost",  // For Capacitor Android/iOS app
    "https://localhost",       // Alternative Capacitor origin
    "ionic://localhost",       // Ionic apps (if needed)
    // "http://localhost:5173",
    // Add other allowed origins here
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "my-social-media-token";

export { corsOptions, CHATTU_TOKEN };
