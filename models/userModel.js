import mongoose from "mongoose";

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, 
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], 
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    profileType: {
      type: String, 
      enum: ["professor", "student"],
      required: true,
    },
    profilePic: {
      type: String, 
      default: "",
    },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
  },
  {
    timestamps: true, 
  }
);

// Create and export the User model
const userModel = mongoose.model("User", userSchema);
export default userModel;
