import mongoose from "mongoose";

const updateSchema = new mongoose.Schema({
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

const UpdateModel = mongoose.model('Update', updateSchema);

export default UpdateModel;

