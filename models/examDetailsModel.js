import mongoose from "mongoose";

const examDetailsResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
    trim: true,
    enum: ["semester 1", "semester 2", "semester 3", "semester 4", "semester 5", "semester 6"],
  },
  examType: {
    type: String,
    required: true,
    trim: true,
    enum: ["internal theory", "internal practical", "external theory", "external practical", "cc theory", "cc practical"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resourceLink: {
    type: String,
    // required: true,
  },
  resourceType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
}, { timestamps: true });

const examDetailsResourceModel = mongoose.model("examDetailsResource", examDetailsResourceSchema);

export default examDetailsResourceModel;
