const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    // "https://cuddly-fortnight-pj9g9jwr9rx9c6667-5173.app.github.dev",
    // "https://cuddly-fortnight-pj9g9jwr9rx9c6667-5000.app.github.dev"
    "https://social-media-adi.vercel.app"
    // "http://localhost:5173",
    // Add other allowed origins here
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "my-social-media-token";

export { corsOptions, CHATTU_TOKEN };
