import mongoose from "mongoose";

const timeTableResourceSchema = new mongoose.Schema({
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
  division: {
    type: String,
    required: true,
    trim: true,
    enum: ["all divisions", "division A", "division B", "division C", "division D", "division E", "division F", "division G"],
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

const timeTableResourceModel = mongoose.model("timeTableResource", timeTableResourceSchema);

export default timeTableResourceModel;
