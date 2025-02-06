import userMessageModel from "../models/UserMessageModel.js"; 
import UserConversation from "../models/UserConversationModel.js"; 


export const allMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Validate conversationId
        if (!conversationId) {
            return res.status(400).json({
                status: "fail",
                error: "Conversation ID is required.",
            });
        }

        // Check if the conversation exists
        const conversation = await UserConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                status: "fail",
                error: "Conversation not found.",
            });
        }

        // Check if the user is a member of the conversation
        if (!conversation.members.includes(req.user._id.toString())) {
            return res.status(403).json({
                status: "fail",
                error: "You are not a member of this conversation.",
            });
        }

        // Fetch all messages for the conversation
        const messages = await userMessageModel
            .find({ conversationId })
            .populate("sender", "_id fullName profilePic studentRollNumber phoneNumber profileType")
            .populate("conversationId");

        // Send success response
        return res.status(200).json({
            status: "success",
            message: "Messages fetched successfully.",
            data: messages,
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            status: "fail",
            error: "An error occurred while fetching messages. Please try again later.",
        });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const { content, conversationId, messageType } = req.body;

        // Validate required fields
        if (!content || !conversationId) {
            return res.status(400).json({
                status: "fail",
                error: "Please provide all required fields: Content and Conversation ID.",
            });
        }

        // Check if the conversation exists
        const conversation = await UserConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                status: "fail",
                error: "Conversation not found.",
            });
        }

        // Check if the user is a member of the conversation
        if (!conversation.members.includes(req.user._id.toString())) {
            return res.status(403).json({
                status: "fail",
                error: "You are not a member of this conversation.",
            });
        }

        // Create a new message
        const newMessage = await userMessageModel.create({
            sender: req.user._id,
            content,
            conversationId,
            messageType: messageType || "text"
        });

        // Populate the sender and conversation details
        const populatedMessage = await newMessage.populate("sender", "_id fullName profilePic studentRollNumber phoneNumber profileType");
        await populatedMessage.populate("conversationId");

        // Update the conversation's latest message
        await UserConversation.findByIdAndUpdate(conversationId, {
            latestMessage: populatedMessage,
        });

        // Send success response
        return res.status(201).json({
            status: "success",
            message: "Message sent successfully.",
            data: populatedMessage,
        });

    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            status: "fail",
            error: "An error occurred while sending the message. Please try again later.",
        });
    }
};