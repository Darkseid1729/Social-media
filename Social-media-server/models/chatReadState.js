import mongoose, { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastReadMessageId: {
      type: Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Denormalized timestamp of the read pointer message for fast seen checks on clients.
    lastReadMessageAt: {
      type: Date,
      default: null,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ chat: 1, user: 1 }, { unique: true });
schema.index({ user: 1, lastReadAt: -1 });

export const ChatReadState =
  mongoose.models.ChatReadState || model("ChatReadState", schema);
