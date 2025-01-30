import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { getMessages, userLikeDislikeResponse, userPrompt } from '../controllers/messageController.js';



const router = express.Router();

router.get('/getMessages/:conversationId', protectRoute, getMessages);
router.post('/userPrompt', protectRoute, userPrompt);
router.post('/userLikeDislikeResponse/:messageId', protectRoute, userLikeDislikeResponse);

export default router;