import { getUserProfile, checkFriendStatus } from "../controllers/user.js";
import express from "express";
import { updateAvatar } from "../controllers/avatar.js";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
} from "../controllers/user.js";
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleAvatar } from "../middlewares/multer.js";

const app = express.Router();

app.post("/new", singleAvatar, registerValidator(), validateHandler, newUser);
app.post("/login", loginValidator(), validateHandler, login);

// After here user must be logged in to access the routes


app.use(isAuthenticated);

// Update avatar
app.put("/avatar", singleAvatar, updateAvatar);

app.get("/me", getMyProfile);



app.get("/logout", logout);

app.get("/search", searchUser);
app.get("/notifications", getMyNotifications);
app.get("/friends", getMyFriends);

// Check friend status with a user
app.get("/friend-status/:userId", checkFriendStatus);

// Get another user's public profile by ID
app.get("/:id", getUserProfile);
app.put(
  "/sendrequest",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

app.put(
  "/acceptrequest",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);


export default app;
