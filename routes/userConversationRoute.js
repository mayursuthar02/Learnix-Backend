import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { createGroupConversation, deleteGroupConversation, getAllUserConversation, markConversationAsRead } from '../controllers/userConversationController.js';

const router = express.Router();

// Admin
router.post("/createGroupConversation", protectRoute, createGroupConversation);
router.post("/getAllUserConversation", protectRoute, getAllUserConversation);
router.post("/deleteGroupConversation", protectRoute, deleteGroupConversation);
router.post("/markAsRead/:conversationId", protectRoute, markConversationAsRead);

export default router;  