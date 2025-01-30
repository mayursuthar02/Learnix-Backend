import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import { addEvent, deleteEvent, editEvents, getAllEvents, getSingleEvent } from '../controllers/eventController.js';

const router = express.Router();

// Client
router.get("/getAllEvents", protectRoute, getAllEvents);
// Admin
router.get("/getAllEventsAdmin", adminProtectRoute, getAllEvents);
router.get("/getSingleEvent/:eventId", adminProtectRoute, getSingleEvent);
router.post("/add", adminProtectRoute, addEvent);
router.put("/edit/:eventId", adminProtectRoute, editEvents);
router.delete("/delete/:eventId", adminProtectRoute, deleteEvent);

export default router;