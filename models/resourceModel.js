import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resourceLink: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
    default: ""
  },
}, { timestamps: true });

const resourceModel = mongoose.model("Resource", resourceSchema);

export default resourceModel;
