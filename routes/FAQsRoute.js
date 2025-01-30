import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import { addFAQ, deleteFAQ, editFAQ, getAllFAQs, getRequestingUserFAQs, getSingleFAQ } from '../controllers/FAQsController.js';

const router = express.Router();

router.get('/getAllFAQs', protectRoute, getAllFAQs);

router.get('/getRequestingUserFAQs', adminProtectRoute, getRequestingUserFAQs);
router.get('/getSingleFAQ/:FAQId', adminProtectRoute, getSingleFAQ);
router.post('/addFAQ', adminProtectRoute, addFAQ);
router.put('/editFAQ/:FAQId', adminProtectRoute, editFAQ);
router.delete('/deleteFAQ/:FAQId', adminProtectRoute, deleteFAQ);

export default router;