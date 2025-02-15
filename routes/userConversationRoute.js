import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { createGroupConversation, getAllUserConversation, markConversationAsRead } from '../controllers/userConversationController.js';

const router = express.Router();

// Admin
router.post("/createGroupConversation", protectRoute, createGroupConversation);
router.post("/getAllUserConversation", protectRoute, getAllUserConversation);
router.post("/markAsRead/:conversationId", protectRoute, markConversationAsRead);

export default router;  