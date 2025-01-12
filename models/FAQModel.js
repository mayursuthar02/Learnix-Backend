import mongoose from "mongoose";

const FAQSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
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
}, {
    timestamps: true,
});

const FAQModel = mongoose.model('FAQ', FAQSchema);

export default FAQModel;

