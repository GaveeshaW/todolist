const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: String,
    isImportant: Boolean,
    isCompleted: Boolean,
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Ensure this is required
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }  
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;