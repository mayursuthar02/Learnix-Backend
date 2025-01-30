import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import { askAQuestion, getProfessorQuestions, getUserReplies, replyQuestion } from '../controllers/questionController.js';



const router = express.Router();

// Client
router.post("/ask-a-question", protectRoute, askAQuestion);
router.get("/getUserReplies", protectRoute, getUserReplies);
// Admin
router.get("/getProfessorQuestions", adminProtectRoute, getProfessorQuestions);
router.put("/replyQuestion/:questionId", adminProtectRoute, replyQuestion);

export default router;