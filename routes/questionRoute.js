import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { askAQuestion } from '../controllers/questionController.js';



const router = express.Router();

router.post("/ask-a-question", protectRoute, askAQuestion);

export default router;