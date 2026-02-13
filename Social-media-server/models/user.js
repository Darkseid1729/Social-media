import mongoose, { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    fcmTokens: [{
      token: { type: String },
      device: { type: String, default: 'android' },
      updatedAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 10);
});

// Add indexes for faster queries
schema.index({ username: 1 });
schema.index({ _id: 1, lastSeen: 1 });

// Text index for efficient full-text search on name, username, and bio
schema.index({ name: "text", username: "text", bio: "text" });

export const User = mongoose.models.User || model("User", schema);
