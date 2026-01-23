import mongoose, { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    wallpaper: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" }
    },
  },
  {
    timestamps: true,
  }
);

// Text index for efficient full-text search on chat name
schema.index({ name: "text" });

export const Chat =mongoose.models.Chat || model("Chat", schema);
