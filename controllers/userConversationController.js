import UserConversationModel from "../models/UserConversationModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createGroupConversation = async (req, res) => {
    try {
        const { members, name } = req.body;
        let { groupConversationIcon } = req.body; 

        if (!members || !name) {
            return res.status(400).json({ 
                status: "fail", 
                error: "Please provide all required fields." 
            });
        }

        const requestingUser = await userModel.findById(req.user._id);
        if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "superAdmin")) {
          return res.status(403).json({
            status: "fail",
            error: "Access denied! Only admins can create group conversation.",
          });
        }
        if (!members.includes(req.user._id.toString())) {
            members.push(req.user._id);  // Add requesting user to the members array if not already present
        }

        if (members.length < 2) {
            return res.status(400).json({ 
                status: "fail", 
                error: "At least 2 members are required to create a group chat." 
            });
        }
        
        if (groupConversationIcon) {
            const uploadedResponse = await cloudinary.uploader.upload(groupConversationIcon);
            groupConversationIcon = uploadedResponse.secure_url;
        }

        const newGroupChatConversation = await new UserConversationModel({
            conversationName: name,
            isGroupChat: true,
            members,
            latestMessage : null,
            groupAdmin: requestingUser._id,
            groupConversationIcon
        })
        await newGroupChatConversation.save();
        
        return res.status(201).json({ 
            status: "success", 
            message: "Group conversation created successfully.", 
            newGroupChatConversation
        });
        
    } catch (error) {
        console.error("Error creating group conversation:", error);
        return res.status(500).json({ 
            status: "fail", 
            error: "An error occurred while creating the group conversation. Please try again later." 
        });
    }
};

export const getAllUserConversation = async (req, res) => {
    try {
        // Convert req.user._id (ObjectId) to a string to match the members' string IDs
        const userIdString = req.user._id.toString();

        // Find conversations where the user is a member
        const userConversations = await UserConversationModel.find({
            members: { $elemMatch: { $eq: userIdString } }
        })
        .populate("members", "-password -resources")
        .populate("groupAdmin", "-password -resources")
        .sort({ updatedAt: -1 })
        
        return res.status(201).json({ 
            status: "success", 
            message: "User conversations successfully get.", 
            userConversations
        });
        
    } catch (error) {
        console.error("Error getting all conversation:", error);
        return res.status(500).json({ 
            status: "fail", 
            error: "An error occurred while getting all conversation. Please try again later." 
        });
    }
}