require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/user');

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4200' }));

let users = [];

mongoose.connect('mongodb://127.0.0.1:27017/tasknest')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.log('MongoDB connection error:', err);
    });

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send('Token is missing');
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send('Invalid token');
        }
        req.userId = user.id;
        next();
    });
}

// Signup Route

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email }); 
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    if (!password) {
      return res.status(400).send('Password is required');
    }

    const hashedPassword = bcrypt.hashSync(password, 8); // Hash the password

    const newUser = new User({ email, password: hashedPassword }); // Create a new User instance
    await newUser.save(); // Save the user to the database

    const token = jwt.sign({ id: newUser._id }, SECRET_KEY); // Generate JWT token
    res.status(201).send({ token });
  } catch (error) {
    res.status(500).send({ message: 'Error creating user', error });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email }); // Fetch user from MongoDB by email
  
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: user._id }, SECRET_KEY); // Generate JWT token
      res.status(200).send({ token });
    } catch (error) {
      res.status(500).send({ message: 'Error logging in', error });
    }
});  

// Add a Task
app.post('/api/tasks', authenticateToken, async (req, res) => {
    const { description, isImportant, isCompleted } = req.body;

    try {
        const newTask = new Task({
            description,
            isImportant,
            isCompleted,
            userId: new mongoose.Types.ObjectId(req.userId) 
        });

        const savedTask = await newTask.save();
        res.status(201).send(savedTask);
    } catch (err) {
        console.error('Error saving task:', err);
        return res.status(500).send({ message: 'Error saving task' });
    }
});

// Fetch Tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(req.userId), deleted: false}).sort({ createdAt: -1 }); 
        res.status(200).send(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).send({ message: 'Error fetching tasks' });
    }
});

// Update task by ID
app.put('/api/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    const updatedData = req.body; 

    if(!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).send("Invalid task ID format");
    }
  
    try {
      const updatedTask = await Task.findByIdAndUpdate(taskId, updatedData, { new: true });
      if (!updatedTask) {
        return res.status(404).send('Task not found');
      }
      res.status(200).send(updatedTask);
    } catch (error) {
      res.status(500).send('Error updating task: ' + error.message);
    }
});   

// Delete a Task (soft delete)
app.put('/api/tasks/:id/delete', authenticateToken, async (req, res) => {
    const taskId = req.params.id;

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(taskId), userId: new mongoose.Types.ObjectId(req.userId) },
            { deleted: true },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).send({ message: 'Task not found or not authorized to delete this task' });
        }
        res.status(200).send(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).send({ message: 'Error deleting task' });
    }
});

// Fetch Deleted Tasks
app.get('/api/tasks/deleted-tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(req.userId), deleted: true }).sort({ updatedAt: -1 });
        res.status(200).send(tasks);
    } catch (err) {
        console.error('Error fetching deleted tasks:', err);
        return res.status(500).send({ message: 'Error fetching deleted tasks' });
    }
});

// Restore a Task
app.put('/api/tasks/:id/restore', authenticateToken, async (req, res) => {
    const taskId = req.params.id;

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(taskId), userId: new mongoose.Types.ObjectId(req.userId) },
            { deleted: false },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).send({ message: 'Task not found or not authorized to restore this task' });
        }
        res.status(200).send(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).send({ message: 'Error restoring task' });
    }
});

if(process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;