import mongoose from "mongoose";

// Define the schema
const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User',
  },
  image: {
    type: String, 
    required: true,
  },
  title: {
    type: String, 
    required: true,
    trim: true,
  },
  description: {
    type: String, 
    required: true,
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true, 
});

const eventModel = mongoose.model('Event', EventSchema);

export default eventModel;
