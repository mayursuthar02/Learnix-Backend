import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        required: true,
    }, 
    title: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["pending", "answered"], 
        default: "pending" 
    },
    reply: { 
        type: String, 
        default: "" 
    },
  },
  { timestamps: true }
);

const questionModel = mongoose.model("Question", questionSchema);

export default questionModel;
