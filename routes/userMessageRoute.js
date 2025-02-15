import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { allMessages, sendMessage } from '../controllers/userMessageController.js';

const router = express.Router();

router.post("/sendMessage", protectRoute, sendMessage);
router.get("/:conversationId", protectRoute, allMessages);

export default router;  