import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import { allMessages, sendMessage } from '../controllers/userMessageController.js';

const router = express.Router();

router.post("/sendMessage", adminProtectRoute, sendMessage);
router.get("/:conversationId", adminProtectRoute, allMessages);

export default router;  