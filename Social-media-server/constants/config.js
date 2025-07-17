const corsOptions = {
  origin: [
    // process.env.CLIENT_URL,
    "https://refactored-eureka-g46564rq6qpwcvj6p-5173.app.github.dev",
    // "https://social-media-adi.vercel.app"
    // "http://localhost:5173",
    // Add other allowed origins here
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "my-social-media-token";

export { corsOptions, CHATTU_TOKEN };
