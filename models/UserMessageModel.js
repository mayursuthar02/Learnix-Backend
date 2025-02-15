import mongoose from "mongoose";

const userMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { 
        type: String, 
        trim: true, 
        validate: {
          validator: function (value) { return this.attachments || value; },
          message: "Content is required if no attachments are provided.",
        },
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserConversation",
      required: true,
    },
    readBy: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ], // Users who have read the message
    reaction: {
        type: String,
        default: ""
    },
    replyTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UserMessage" 
    }, // Message being replied to
    attachments: { type: String, default: "" }, // URLs for images, videos, etc.
    isEdited: { type: Boolean, default: false }, // Flag for edited messages
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "sticker"],
      default: "text",
    },
  },
  { timestamps: true }
);

const userMessageModel = mongoose.model("UserMessage", userMessageSchema);
export default userMessageModel;
