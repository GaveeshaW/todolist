require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

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
app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    if (!password) {
        return res.status(400).send('Password is required');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = {
        id: new mongoose.Types.ObjectId(), 
        email,
        password: hashedPassword
    };

    users.push(newUser);
    const token = jwt.sign({ id: newUser.id }, SECRET_KEY);

    res.status(201).send({ token });
});

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY);
    res.status(200).send({ token });
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
        const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(req.userId) }).sort({ createdAt: -1 }); 
        res.status(200).send(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).send({ message: 'Error fetching tasks' });
    }
});

// Edit a Task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { description, isImportant, isCompleted } = req.body;
    const taskId = req.params.id;

    console.log('Request body:', req.body);  // Add this line to inspect incoming data
    console.log('Task ID:', taskId);

    if (!description || isImportant === undefined || isCompleted === undefined) {
        return res.status(400).send({ message: 'Missing required task fields' });
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(taskId), userId: new mongoose.Types.ObjectId(req.userId) }, 
            { description, isImportant, isCompleted },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).send({ message: 'Task not found or not authorized' });
        }
        res.status(200).send({ updatedTask });
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).send({ message: 'Error updating task' });
    }
});

// Delete a Task (soft delete)
app.put('/api/tasks/:id/delete', authenticateToken, async (req, res) => {
    const taskId = req.params.id;

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId: req.userId },
            { isDeleted: true },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found or not authorized to delete this task' });
        }
        res.status(200).json({ message: 'Task deleted successfully', task: updatedTask });
    } catch (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ message: 'Error deleting task' });
    }
});

// Fetch Deleted Tasks
app.get('/api/tasks/deleted-tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(req.userId), isDeleted: true }).sort({ updatedAt: -1 });
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
            { isDeleted: false },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).send({ message: 'Task not found or not authorized to restore this task' });
        }
        res.status(200).send(updatedTask);
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).send({ message: 'Error updating task' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
