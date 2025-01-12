import messageModel from "../models/messageModel.js";


export const getMessages = async(req, res) => {
    try {
        const {conversationId} = req.params;
        if (!conversationId) {
            return res.status(400).json({
                status: "fail",
                error: "conversationId is not found!"
            });
        };

        const messages = await messageModel.find({conversationId});
        if (!messages || messages.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "No messages found for this conversationId."
            });
        }

        res.status(200).json({
            status: "success",
            message: "Messages fetched successfully",
            messages
        })
        
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            status: "error",
            error: "Something went wrong. Please try again later.",
        });
    }
}  

export const userPrompt = async(req, res) => {
    try {
        const {conversationId, prompt} = req.body;
        if (!conversationId) {
            return res.status(400).json({
                status: "fail",
                error: "conversationId not found!"
            });
        };
        if (!prompt) {
            return res.status(400).json({
                status: "fail",
                error: "Prompt not found!"
            });
        };

        const newMessage = await messageModel({
            conversationId,
            sender: "user",
            userPrompt: prompt,
        });
        await newMessage.save();

        return res.status(201).json({
            status: "success",
            message: "User prompt stored successfully.",
            data: newMessage
        });

    } catch (error) {
        console.error("Error in storing user messages:", error);
        return res.status(500).json({
            status: "error",
            error: "Something went wrong. Please try again later.",
        });
    }
}