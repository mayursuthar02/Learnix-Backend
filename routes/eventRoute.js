import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { addEvent, deleteEvent, editEvents, getAllEvents, getSingleEvent } from '../controllers/eventController.js';

const router = express.Router();

// Client
router.get("/getAllEvents", protectRoute, getAllEvents);
// Admin
router.get("/getAllEventsAdmin", protectRoute, getAllEvents);
router.get("/getSingleEvent/:eventId", protectRoute, getSingleEvent);
router.post("/add", protectRoute, addEvent);
router.put("/edit/:eventId", protectRoute, editEvents);
router.delete("/delete/:eventId", protectRoute, deleteEvent);

export default router;