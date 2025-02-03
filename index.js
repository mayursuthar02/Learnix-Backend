// Packages
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";

// Routes Import
import userRoute from './routes/userRoute.js';
import resourceRoute from './routes/resourceRoute.js';
import examDetailsRoute from './routes/examDetailsRoute.js';
import timeTableRoute from './routes/timeTableRoute.js';
import previousPaperRoute from './routes/previousPaperRoute.js';
import chatRoute from './routes/chatRoute.js';
import messageRoute from './routes/messageRoute.js';
import conversationRoute from './routes/conversationRoute.js';
import updateRoute from './routes/updateRoute.js';
import FAQsRoute from './routes/FAQsRoute.js';
import questionRoute from './routes/questionRoute.js';
import eventRoute from './routes/eventRoute.js';

// Database Import
import connectDB from './db/connectDB.js';


// Configutation
dotenv.config();
const app = express();
const allowedOrigins = ['http://localhost:4050', 'http://localhost:5050'];


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Database Connection
connectDB();


// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({limit: '20mb', extended: true }));
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser());


// Routes
app.use('/api/auth', userRoute);
app.use('/api/users', userRoute);
app.use('/api/resources', resourceRoute);
app.use('/api/examDetails', examDetailsRoute);
app.use('/api/timeTables', timeTableRoute);
app.use('/api/previousPapers', previousPaperRoute);
app.use('/api/updates', updateRoute);
app.use('/api/FAQs', FAQsRoute);
app.use('/api/chats', chatRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/questions', questionRoute);
app.use('/api/events', eventRoute);


// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`Server listen on port : ${PORT}`);
});