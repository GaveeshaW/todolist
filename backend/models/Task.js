const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  isImportant: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  userId: { type: Number, required: true } // This should store the userId
});

module.exports = mongoose.model('Task', TaskSchema);
