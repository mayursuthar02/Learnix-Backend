import conversationModel from '../models/conversationModel.js';
import messageModel from '../models/messageModel.js';

export const getConversations = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({ 
                status: "fail", 
                error: 'Invalid user. Please log in and try again.' 
            });
        }

        const conversations = await conversationModel
        .find({ userId: req.user._id })
        .sort({ createdAt: -1 });
        
        return res.status(200).json({ 
            status: "success", 
            message: 'Conversations fetched successfully.', 
            conversations 
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ 
            status: "fail", 
            error: 'An error occurred while fetching conversations. Please try again later.' 
        });
    }
};


export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!conversationId) {
            return res.status(400).json({ 
                status: "fail", 
                error: 'Conversation ID is required.' 
            });
        }

        const conversation = await conversationModel.findOne({
            _id: conversationId,
            userId: req.user._id,
        });

        if (!conversation) {
            return res.status(404).json({ 
                status: "fail", 
                error: 'Conversation not found or not authorized to delete.' 
            });
        }

        // Delete the conversation
        await conversationModel.findByIdAndDelete(conversationId);

        await messageModel.deleteMany({ conversationId });

        return res.status(200).json({
            status: "success",
            message: 'Conversation deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return res.status(500).json({
            status: "error",
            error: 'An error occurred while deleting the conversation. Please try again later.',
        });
    }
};
