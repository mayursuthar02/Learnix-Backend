import mongoose from "mongoose";

const UserConversationSchema = new mongoose.Schema(
  {
    conversationName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupConversationIcon: {
      type: String,
      default: ""
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserMessage",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    unreadCounts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const UserConversation = mongoose.model("UserConversation", UserConversationSchema);

export default UserConversation;
