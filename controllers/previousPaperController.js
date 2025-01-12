import userModel from "../models/userModel.js";
import previousPapersResourceModel from "../models/previousPaperModel.js";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getPreviousPaperResources = async (req, res) => {
  try {
    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can get resources.",
      });
    }

    const resources = await previousPapersResourceModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(201).json({
      status: "success",
      message: "Resources getting successfully.",
      resources,
    });
  } catch (error) {
    console.error("Error getting resource:", error);
    res.status(500).json({
      status: "error",
      error: "Error getting resource: " + error.message,
    });
  }
};

export const uploadPreviousPaperResource = async (req, res) => {
  try {
    const { title, semester, examType, resourceLink, description } = req.body;
    let url = "";
    if (!title || !semester || !examType) {
      return res.status(422).json({
        status: "fail",
        error: "title, semester and examType fields are required!",
      });
    }

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can upload resources.",
      });
    }

    if (req.file) {
      const fileType = req.file.mimetype;
      const isImage = fileType.startsWith("image/");
      const extension = fileType.split("/")[1];

      // Generate filename with proper extension
      const fileName = `${uuidv4()}_${title.replace(/\s+/g, "_")}.${extension}`;
      const folder = isImage ? "images" : "resources";
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: "auto",
          public_id: `${folder}/${fileName}`,
        },
        (error, result) => {
          if (error) {
            throw new Error(error.message);
          }
          return result;
        }
      );
      url = result.url;
    } else {
      url = resourceLink;
    }

    // Store in Database
    const newResource = new previousPapersResourceModel({
      title,
      semester,
      examType,
      userId: req.user._id,
      resourceLink: url,
      resourceType: req.file ? req.file.mimetype.split("/")[0] : "link",
      description,
    });
    await newResource.save();

    requestingUser.resources.push(newResource);
    await requestingUser.save();

    res.status(201).json({
      status: "success",
      message: "Resource uploaded successfully",
      newResource,
    });
  } catch (error) {
    console.error("Error uploading resource:", error);
    res.status(500).json({
      status: "error",
      error: "Error uploading resource: " + error.message,
    });
  }
};

export const updatePreviousPaperResource = async (req, res) => {
  try {
    const { id } = req.params; // ID of the resource to update
    const { title, semester, examType, resourceLink, description } = req.body;
    let updatedUrl = "";

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can update resources.",
      });
    }

    // Fetch the existing resource
    const resource = await previousPapersResourceModel.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (
      resource.resourceLink &&
      resource.resourceLink.includes("cloudinary.com")
    ) {
      const publicId = resource.resourceLink.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`resources/${publicId}`, {
        resource_type: "raw",
      });
    }

    if (req.file) {
      const fileName = `${uuidv4()}_${title.replace(/\s+/g, "_")}.pdf`;
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: "auto",
          public_id: `resources/${fileName}`,
        },
        (error, result) => {
          if (error) {
            throw new Error(error.message);
          }
          return result;
        }
      );
      updatedUrl = result.url;
    } else if (resourceLink) {
      // Use the provided URL
      updatedUrl = resourceLink;
    } else {
      // No valid input for resourceLink
      return res.status(400).json({
        success: false,
        message: "Either a file or a valid resource link must be provided",
      });
    }

    // Update the resource in the database
    resource.title = title || resource.title;
    resource.semester = semester || resource.semester;
    resource.examType = examType || resource.examType;
    resource.description = description || resource.description;
    resource.resourceLink = updatedUrl;
    await resource.save();

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({
      success: false,
      message: "Error updating resource",
      error: error.message,
    });
  }
};

export const deletePreviousPaperResource = async (req, res) => {
  try {
    const { id } = req.params; // ID of the resource to delete

    const requestingUser = await userModel.findById(req.user._id);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
      return res.status(403).json({
        status: "fail",
        error: "Access denied! Only admins can delete resources.",
      });
    }

    const resource = await previousPapersResourceModel.findById(id);
    if (!resource) {
      return res.status(404).json({
        status: "fail",
        error: "Resource not found",
      });
    }
    // Delete the resource file from Cloudinary if it exists
    if (
      resource.resourceLink &&
      resource.resourceLink.includes("cloudinary.com")
    ) {
      const publicId = resource.resourceLink.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`resources/${publicId}`, {
        resource_type: "raw",
      });
    }
    // Delete the resource from the database
    await previousPapersResourceModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Resource deleted successfully",
    });

    requestingUser.resources.pop(id);
    await requestingUser.save();
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({
      status: "success",
      error: "Error deleting resource" + error.message,
    });
  }
};

export const getSinglePreviousPaperResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        status: "fail",
        error: "Id not found",
      });
    }

    const resource = await previousPapersResourceModel.findById(id);
    if (!resource) {
      return res.status(404).json({
        status: "fail",
        error: "resource not found",
      });
    }

    res.status(201).json({
      status: "success",
      message: "Resource getting successfully.",
      resource,
    });
  } catch (error) {
    console.error("Error getting resource:", error);
    res.status(500).json({
      status: "error",
      error: "Error getting resource: " + error.message,
    });
  }
};
