import mongoose, { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    caller: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
        },
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["missed", "rejected", "answered", "failed"],
      default: "missed",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ chat: 1, createdAt: -1 });
schema.index({ caller: 1, createdAt: -1 });
schema.index({ "participants.user": 1, createdAt: -1 });

export const CallRecord = mongoose.models.CallRecord || model("CallRecord", schema);
