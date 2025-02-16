import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",
    },
    sender: {
      type: String,
      enum: ["user", "learnix", "ai"],
      required: true,
    },
    userPrompt: {
      type: String,
      trim: true,
      default: "",
    },
    botResponse: {
      message: {
        type: String,
        trim: true,
      },
      options: [
        {
          option: { type: String, trim: true },
          apiRoute: { type: String, trim: true },
        },
      ], 
      resources: [
        {
          title: { type: String, trim: true },
          subject: { type: String, trim: true },
          examType: { type: String, trim: true },
          division: { type: String, trim: true },
          semester: { type: String, trim: true },
          resourceLink: { type: String, trim: true },
          note: { type: String, trim: true },
          description: { type: String, trim: true },
          author: { type: String, trim: true }, 
          authorProfilePic: { type: String, trim: true }, 
        },
      ], 
      note: {
        type: String,
        trim: true,
      },
    },
    aiResponse: {
      type: String,
      trim: true,
    },
    responseType : {
      type: String,
      enum: ["good", "bad", ""],  
      default: "",
    },
    usersReacted : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
