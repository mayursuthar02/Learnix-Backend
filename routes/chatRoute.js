import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { activateLearnix, getMaterials, getSemester, start, studentDataSelector, textToSpeech } from '../controllers/chatController.js';
import multer from 'multer';


const router = express.Router();

router.post('/start', protectRoute, start);
router.post('/get-semster/:option', protectRoute, getSemester);
router.post('/student-data-Selector/:option/:semester', protectRoute, studentDataSelector);
router.post('/get-resources/:option/:semester/:studentDataSelector', protectRoute, getMaterials);

// Learnix
router.post('/activateScholara', protectRoute, activateLearnix);
router.post('/textToSpeech', protectRoute, textToSpeech);

export default router;