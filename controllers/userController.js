import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
// Model Import
import userModel from "../models/userModel.js";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a Nodemailer transporter (using Gmail in this example)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "erna.schiller64@ethereal.email",
    pass: "nmT9w8BSRf7ReD4vh4",
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: "floy.boyer@ethereal.email", // Replace with your email
      to,
      subject,
      html: text, // Send HTML content if needed
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

export const SignupUser = async (req, res) => {
  try {
    const { fullName, email, password, profileType } = req.body;

    if (!fullName || !email || !password || !profileType) {
      return res.status(422).json({
        status: "fail",
        error: "All fields are required!",
      });
    }

    const existsUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existsUser) {
      return res.status(409).json({
        status: "fail",
        error: "User already exists with this email!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      profileType,
      profilePic:
        "https://imgcdn.stablediffusionweb.com/2024/10/26/9fc00e9d-1028-4590-9f0f-aa3b812b7926.jpg",
    });
    await newUser.save();

    // Send verification email
    const text = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Professor Access Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #007BFF;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          background-color: #f1f1f1;
          padding: 10px;
          font-size: 14px;
          color: #555;
        }
        .button {
          display: inline-block;
          background-color: #007BFF;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin-top: 20px;
        }
        .button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Request for Professor Access</h1>
        </div>
        <div class="content">
          <p>Dear Admin,</p>
          <p>A user has requested to be granted professor access on the platform.</p>
          <p><strong>User Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${fullName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Profile Type:</strong> Professor</li>
          </ul>
          <p>Please review and approve the request in the admin dashboard.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Scholara. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    if (profileType === "professor") {
      sendEmail(email, "Verification email", text);
    }

    res.status(201).json({
      status: "success",
      message: "User signup successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      status: "error",
      error: "Server error occurred. Please try again later.",
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", error: "All fields are required!" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", error: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ status: "fail", error: "Invalid email or password" });
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return res.status(403).json({
        status: "fail",
        error: "Access denied. Admin privileges required.",
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("token", token, {
      httpOnly: true, //more secure
      maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
      sameSite: "strict", // CSRF
    });

    res.status(201).json({
      status: "success",
      message: "Admin Loggedin Successfully",
      userData: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        token,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      error: "Error in admin login: " + error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", error: "All fields are required!" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", error: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ status: "fail", error: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("token", token, {
      httpOnly: true, //more secure
      maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
      sameSite: "strict", // CSRF
    });

    res.status(200).json({
      status: "success",
      message: "User loggedin successfully.",
      userData: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        token,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      error: "Error in login user: " + error.message,
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const allUsers = await userModel
      .find({ profileType: "student" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      message: "Students fetched successfully",
      allUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getAllProfessors = async (req, res) => {
  try {
    const allUsers = await userModel
      .find({ profileType: "professor" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      message: "Professors fetched successfully",
      allUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!role) {
      return res
        .status(400)
        .json({ status: "fail", error: "Role is required." });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || requestingUser.role !== "superAdmin") {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only Super Admin can update roles.",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }
    user.role = role || user.role;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User role updated successfully.",
    });
  } catch (error) {
    console.error("Error updating role:", error.message);
    res.status(500).json({
      status: "error",
      error: "An error occurred while updating the role. " + error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || requestingUser.role !== "superAdmin") {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only Super Admin can delete users.",
      });
    }

    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }
    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      status: "error",
      error: "An error occurred while deleting the user. " + error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({
      status: "success",
      message: "User logged out successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "fail",
      error: "Error in logout" + error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    // Update User
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;
    await user.save();

    // Password should be null in response
    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Error in update user " + error.message });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;

    const { userId } = req.params;

    if (!fullName && !email && !role) {
      return res.status(400).json({
        status: "fail",
        error:
          "At least one field (fullName, email, or role) is required to update",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || requestingUser.role !== "superAdmin") {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only Super Admin can update user details",
      });
    }
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    // Check for duplicate email if email is being updated
    if (email && email !== userData.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: "fail",
          error: "A user already exists with this email address",
        });
      }
    }

    userData.fullName = fullName || userData.fullName;
    userData.email = email || userData.email;
    userData.role = role || userData.role;
    await userData.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "User details updated successfully",
        userData,
      });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      status: "error",
      error: "An error occurred while updating the user. " + error.message,
    });
  }
};

export const fetchSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify if the requesting user is a Super Admin
    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || requestingUser.role !== "superAdmin") {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only Super Admin can view user details",
      });
    }

    // Fetch the user details by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        error: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({
      status: "error",
      error: `An unexpected error occurred while fetching the user: ${error.message}`,
    });
  }
};
