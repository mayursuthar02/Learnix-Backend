import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { addUpdate, deleteUpdate, editUpdate, getAllUpdates, getRequestingUserUpdates, getSingleUpdate } from '../controllers/updateController.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';

const router = express.Router();

// User
router.get('/getAllUpdates', protectRoute, getAllUpdates);

// Client
router.get('/getRequestingUserUpdates', protectRoute, getRequestingUserUpdates);
router.get('/getSingleUpdate/:updateId', protectRoute, getSingleUpdate);
router.post('/addUpdate', protectRoute, addUpdate);
router.put('/editUpdate/:updateId', protectRoute, editUpdate);
router.delete('/deleteUpdate/:updateId', protectRoute, deleteUpdate);

export default router;  