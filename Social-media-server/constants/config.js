const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "https://social-media-adi.vercel.app",
    "http://localhost:5173",
    "https://refactored-eureka-g46564rq6qpwcvj6p-5173.app.github.dev"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "my-social-media-token";

export { corsOptions, CHATTU_TOKEN };
