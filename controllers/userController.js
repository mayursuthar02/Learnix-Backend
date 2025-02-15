import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
// Services
import sendEmail from "../services/emailService.js";
// Model Import
import userModel from "../models/userModel.js";


export const authCheck = async (req, res) => {
  try {
    // Get token from cookies or headers
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token)
      return res
        .status(401)
        .json({success: false, status: "fail", error: "Unauthorized - No token provided" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({success: false,  error: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: "Invalid or Expired Token" });
  }
};

export const SignupUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      profileType,
      phoneNumber,
      studentRollNo,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !profileType || !phoneNumber) {
      return res.status(422).json({
        status: "fail",
        error: "All fields are required!",
      });
    }

    // If student, ensure studentRollNo is provided
    if (profileType === "student" && !studentRollNo) {
      return res.status(422).json({
        status: "fail",
        error: "Student Roll Number is required for students!",
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
      phoneNumber,
      studentRollNumber: profileType === "student" ? studentRollNo : undefined,
      profilePic:
        "https://imgcdn.stablediffusionweb.com/2024/10/26/9fc00e9d-1028-4590-9f0f-aa3b812b7926.jpg",
    });
    await newUser.save();

    // Send verification email for professors
    if (profileType === "professor") {
      const text = `
        Dear SuperAdmin, 
        A user has requested to be granted professor access on the Learnix Platform.
        
        User Details:
        Name: ${fullName}
        Email: ${email}
        Profile Type: Professor
      `;
      await sendEmail(email, "Verification email", text); // Send the email
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

    // res.cookie("token", token, {
    //   httpOnly: true, //more secure
    //   maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
    //   sameSite: "strict", // CSRF
    // });

    res.status(201).json({
      status: "success",
      message: "Admin Loggedin Successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
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

    // res.cookie("token", token, {
    //   httpOnly: true, //more secure
    //   maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
    //   sameSite: "strict", // CSRF
    // });

    res.status(200).json({
      status: "success",
      message: "User loggedin successfully.",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
        studentRollNumber: user.studentRollNumber,
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

export const userLogout = async (req, res) => {
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
    const { fullName, phoneNumber, studentRollNumber } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    if (!user)
      return res.status(400).json({ status: "fail", error: "User not found" });

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
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.studentRollNumber = studentRollNumber || user.studentRollNumber;
    user.profilePic = profilePic || user.profilePic;
    await user.save();

    // Password should be null in response
    user.password = null;
    console.log(user);
    res.status(200).json({ status: "success", user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "error",
      error: "Error in update user " + error.message,
    });
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

    res.status(200).json({
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

export const getAdminProfessors = async (req, res) => {
  try {
    const adminProfessors = await userModel
      .find({
        profileType: "professor",
        role: { $in: ["admin", "superAdmin"] },
      })
      .select("fullName profilePic");

    // Send success response
    res.status(200).json({
      status: "success",
      message: "Admin Professors fetched successfully",
      adminProfessors,
    });
  } catch (error) {
    console.error("Error fetching admin professors:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error fetching admin professors",
      error: error.message,
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.params;

    const regex = new RegExp(query, "i"); // Case-insensitive search

    const users = await userModel
      .find({
        $or: [{ fullName: regex }, { studentRollNumber: regex }],
      })
      .select("fullName profilePic _id studentRollNumber");

    res.status(200).json({ status: "success", users });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({
        status: "error",
        error: "Error in searching users: " + error.message,
      });
  }
};
