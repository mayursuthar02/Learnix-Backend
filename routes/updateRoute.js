import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { addUpdate, deleteUpdate, editUpdate, getAllUpdates, getRequestingUserUpdates, getSingleUpdate } from '../controllers/updateController.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';

const router = express.Router();

// User
router.get('/getAllUpdates', protectRoute, getAllUpdates);

// Client
router.get('/getRequestingUserUpdates', adminProtectRoute, getRequestingUserUpdates);
router.get('/getSingleUpdate/:updateId', adminProtectRoute, getSingleUpdate);
router.post('/addUpdate', adminProtectRoute, addUpdate);
router.put('/editUpdate/:updateId', adminProtectRoute, editUpdate);
router.delete('/deleteUpdate/:updateId', adminProtectRoute, deleteUpdate);

export default router;  