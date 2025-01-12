import FAQModel from '../models/FAQModel.js';
import userModel from "../models/userModel.js";

export const getAllFAQs = async (req, res) => {
  try {
    const FAQs = await FAQModel.find().populate("userId", "fullName");

    res.status(200).json({
      status: "success",
      message: "FAQs fetched successfully!",
      FAQs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      status: "error",
      error: "Error fetching FAQs: " + error.message,
    });
  }
};

export const addFAQ = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(422).json({
        status: "fail",
        error: "title and description fields are required!",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can add FAQ.",
      });
    }

    const newFAQ = new FAQModel({
      title,
      description,
      userId: req.user._id,
    });
    await newFAQ.save();

    res.status(201).json({
      status: "success",
      message: "FAQ adding successfully",
      newFAQ,
    });
  } catch (error) {
    console.error("Error adding FAQ:", error);
    res.status(500).json({
      status: "error",
      error: "Error adding FAQ: " + error.message,
    });
  }
};

export const editFAQ = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { FAQId } = req.params;

    if (!FAQId || (!title && !description)) {
      return res.status(422).json({
        status: "fail",
        error:
          "FAQId and at least one of title or description fields are required!",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can edit FAQ.",
      });
    }

    const FAQ = await FAQModel.findById(FAQId);
    if (!FAQ) {
      return res.status(404).json({
        status: "fail",
        error: "FAQ not found!",
      });
    }

    // Update the fields
    if (title) FAQ.title = title;
    if (description) FAQ.description = description;
    await FAQ.save();

    res.status(200).json({
      status: "success",
      message: "FAQ edited successfully!",
      updatedFAQ: FAQ,
    });
  } catch (error) {
    console.error("Error editing FAQ:", error);
    res.status(500).json({
      status: "error",
      error: "Error editing FAQ: " + error.message,
    });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { FAQId } = req.params;

    if (!FAQId) {
      return res.status(422).json({
        status: "fail",
        error: "FAQId is required!",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can delete FAQ.",
      });
    }

    // Find and delete the update
    const deletedFAQ = await FAQModel.findByIdAndDelete(FAQId);
    if (!deletedFAQ) {
      return res.status(404).json({
        status: "fail",
        error: "FAQ not found!",
      });
    }

    res.status(200).json({
      status: "success",
      message: "FAQ deleted successfully!",
      deletedFAQ,
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({
      status: "error",
      error: "Error deleting FAQ: " + error.message,
    });
  }
};

export const getRequestingUserFAQs = async (req, res) => {
  try {
    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can get FAQs.",
      });
    }

    const FAQs = await FAQModel.find({ userId: requestingUser._id })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email");

    res.status(200).json({
      status: "success",
      message: "FAQs fetched successfully!",
      FAQs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      status: "error",
      error: "Error fetching FAQs: " + error.message,
    });
  }
};

export const getSingleFAQ = async (req, res) => {
  try {
    const { FAQId } = req.params;
    if (!FAQId) {
      return res.status(404).json({
        status: "fail",
        error: "FAQId not found",
      });
    }

    const FAQ = await FAQModel.findById(FAQId);
    if (!FAQ) {
      return res.status(404).json({
        status: "fail",
        error: "FAQ not found",
      });
    }

    res.status(201).json({
      status: "success",
      message: "FAQ getting successfully.",
      FAQ,
    });
  } catch (error) {
    console.error("Error getting FAQ:", error);
    res.status(500).json({
      status: "error",
      error: "Error getting FAQ: " + error.message,
    });
  }
};
