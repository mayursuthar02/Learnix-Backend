import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { addFAQ, deleteFAQ, editFAQ, getAllFAQs, getRequestingUserFAQs, getSingleFAQ } from '../controllers/FAQsController.js';

const router = express.Router();

router.get('/getAllFAQs', protectRoute, getAllFAQs);
router.get('/getRequestingUserFAQs', protectRoute, getRequestingUserFAQs);
router.get('/getSingleFAQ/:FAQId', protectRoute, getSingleFAQ);
router.post('/addFAQ', protectRoute, addFAQ);
router.put('/editFAQ/:FAQId', protectRoute, editFAQ);
router.delete('/deleteFAQ/:FAQId', protectRoute, deleteFAQ);

export default router;