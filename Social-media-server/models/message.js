import mongoose, { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    content: String,

    attachments: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    reactions: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        emoji: {
          type: String,
          required: true,
          enum: ["👍", "❤️", "😂", "😮", "😢", "😡"]
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Reply to another message
    replyTo: {
      type: Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.models.Message || model("Message", schema);
