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

    // Optional client-generated ID (e.g. UUID) to support client-side message IDs
    clientId: {
      type: String,
      index: true,
      sparse: true,
      default: null,
    },

    // Reply to another message: may be an ObjectId or a client-generated ID (string)
    replyTo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Soft delete fields
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Forward tracking
    isForwarded: {
      type: Boolean,
      default: false,
    },
    originalMessage: {
      type: Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for efficient queries and sorting
schema.index({ chat: 1, createdAt: -1 });
schema.index({ createdAt: -1 });
schema.index({ sender: 1, createdAt: -1 });

// Text index for efficient full-text search on message content
schema.index({ content: "text" });

export const Message = mongoose.models.Message || model("Message", schema);
