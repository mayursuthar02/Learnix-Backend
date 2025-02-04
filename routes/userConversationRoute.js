import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import { createGroupConversation, getAllUserConversation } from '../controllers/userConversationController.js';

const router = express.Router();

// Admin
router.post("/createGroupConversation", adminProtectRoute, createGroupConversation);
router.get("/getAllUserConversation", adminProtectRoute, getAllUserConversation);


export default router;  