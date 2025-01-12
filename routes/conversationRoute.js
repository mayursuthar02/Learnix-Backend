import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { deleteConversation, getConversations } from '../controllers/conversationController.js';



const router = express.Router();

router.get("/getConversations", protectRoute, getConversations);
router.delete('/deleteConversation/:conversationId', protectRoute, deleteConversation);


export default router;