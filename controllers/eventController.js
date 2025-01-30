import eventModel from "../models/eventModel.js";
import { v2 as cloudinary } from "cloudinary";

export const addEvent = async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;
    let { image } = req.body;

    if (!title || !description || !eventDate || !image) {
      return res.status(422).json({
        status: "fail",
        error: "All fields are required!",
      });
    }

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    const newEvent = await new eventModel({
      userId: req.user._id,
      title,
      description,
      eventDate,
      image,
    });
    await newEvent.save();
    res.status(201).json({
      status: "success",
      message: "Event added successfully",
      newEvent,
    });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({
      status: "error",
      error: "Error adding event: " + error.message,
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find()
      .populate("userId", "_id fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(201).json({
      status: "success",
      message: "Event getting successfully",
      events,
    });
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(500).json({
      status: "error",
      error: "Error getting event: " + error.message,
    });
  }
};

export const editEvents = async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;
    let { image } = req.body;
    const { eventId } = req.params;
    const MAX_FILE_SIZE = 10485760; // 10 MB in bytes

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID is required" });
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (image && !image.startsWith("http")) {
      const base64Data = image.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      if (imageBuffer.length > MAX_FILE_SIZE) {
        return res
          .status(400)
          .json({ error: "File size too large. Maximum is 10 MB." });
      }

      // Destroy old image in Cloudinary if it exists
      if (event.image) {
        await cloudinary.uploader.destroy(
          event.image.split("/").pop().split(".")[0]
        );
      }
      // Upload new image to Cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.eventDate = eventDate || event.eventDate;
    event.image = image || event.image;

    await event.save();
    res.status(200).json({
      status: "success",
      message: "Event edited successfully",
      event,
    });
  } catch (error) {
    console.error("Error editing event:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error editing event: " + error.message,
    });
  }
};

export const getSingleEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(201).json({
      status: "success",
      message: "Event getting successfully",
      event,
    });
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(500).json({
      status: "error",
      error: "Error getting event: " + error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "fail",
        error: "Event not found",
      });
    }

    if (event.image) {
      const publicId = event.image.split("/").pop().split(".")[0]; // Extract the public ID
      await cloudinary.uploader.destroy(publicId);
    }

    await eventModel.findByIdAndDelete(eventId);
    res.status(200).json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      status: "success",
      error: "Error deleting event" + error.message,
    });
  }
};
