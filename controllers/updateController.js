import UpdateModel from "../models/updateModel.js";
import userModel from "../models/userModel.js";

export const getAllUpdates = async (req, res) => {
  try {
    const updates = await UpdateModel.find().populate("userId", "fullName profilePic").sort({createdAt: -1});

    res.status(200).json({
      status: "success",
      message: "Updates fetched successfully!",
      updates,
    });
  } catch (error) {
    console.error("Error fetching updates:", error);
    res.status(500).json({
      status: "error",
      error: "Error fetching updates: " + error.message,
    });
  }
};

export const addUpdate = async (req, res) => {
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
        error: "Access denied! Only admins can add updates.",
      });
    }

    const newUpdate = new UpdateModel({
      title,
      description,
      userId: req.user._id,
    });
    await newUpdate.save();

    res.status(201).json({
      status: "success",
      message: "Update adding successfully",
      newUpdate,
    });
  } catch (error) {
    console.error("Error adding Update:", error);
    res.status(500).json({
      status: "error",
      error: "Error adding Update: " + error.message,
    });
  }
};

export const editUpdate = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { updateId } = req.params;

    if (!updateId || (!title && !description)) {
      return res.status(422).json({
        status: "fail",
        error:
          "updateId and at least one of title or description fields are required!",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can edit updates.",
      });
    }

    const update = await UpdateModel.findById(updateId);
    if (!update) {
      return res.status(404).json({
        status: "fail",
        error: "Update not found!",
      });
    }

    // Update the fields
    if (title) update.title = title;
    if (description) update.description = description;
    await update.save();

    res.status(200).json({
      status: "success",
      message: "Update edited successfully!",
      updatedUpdate: update,
    });
  } catch (error) {
    console.error("Error editing Update:", error);
    res.status(500).json({
      status: "error",
      error: "Error editing Update: " + error.message,
    });
  }
};

export const deleteUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;

    if (!updateId) {
      return res.status(422).json({
        status: "fail",
        error: "updateId is required!",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can delete updates.",
      });
    }

    // Find and delete the update
    const deletedUpdate = await UpdateModel.findByIdAndDelete(updateId);
    if (!deletedUpdate) {
      return res.status(404).json({
        status: "fail",
        error: "Update not found!",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Update deleted successfully!",
      deletedUpdate,
    });
  } catch (error) {
    console.error("Error deleting Update:", error);
    res.status(500).json({
      status: "error",
      error: "Error deleting Update: " + error.message,
    });
  }
};

export const getRequestingUserUpdates = async (req, res) => {
  try {
    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can delete updates.",
      });
    }

    const updates = await UpdateModel.find({ userId: requestingUser._id })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email");

    res.status(200).json({
      status: "success",
      message: "Updates fetched successfully!",
      updates,
    });
  } catch (error) {
    console.error("Error fetching updates:", error);
    res.status(500).json({
      status: "error",
      error: "Error fetching updates: " + error.message,
    });
  }
};

export const getSingleUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    if (!updateId) {
      return res.status(404).json({
        status: "fail",
        error: "updateId not found",
      });
    }

    const update = await UpdateModel.findById(updateId);
    if (!update) {
      return res.status(404).json({
        status: "fail",
        error: "resource not found",
      });
    }

    res.status(201).json({
      status: "success",
      message: "Resource getting successfully.",
      update,
    });
  } catch (error) {
    console.error("Error getting resource:", error);
    res.status(500).json({
      status: "error",
      error: "Error getting resource: " + error.message,
    });
  }
};
