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
        id: new mongoose.Types.ObjectId(), // Use 'new' keyword here
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
            userId: new mongoose.Types.ObjectId(req.userId) // Use 'new' keyword here
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
        const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(req.userId) }); // Use 'new' keyword here
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

    if (!description || isImportant === undefined || isCompleted === undefined) {
        return res.status(400).send({ message: 'Missing required task fields' });
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(taskId), userId: new mongoose.Types.ObjectId(req.userId) }, // Use 'new' keyword here
            { description, isImportant, isCompleted },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).send({ message: 'Task not found or not authorized' });
        }
        res.status(200).send({ message: 'Task updated successfully', task: updatedTask });
    } catch (err) {
        console.error('Error updating task:', err);
        return res.status(500).send({ message: 'Error updating task' });
    }
});

// Delete a Task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOneAndDelete({ _id: new mongoose.Types.ObjectId(taskId), userId: new mongoose.Types.ObjectId(req.userId) }); // Use 'new' keyword here

        if (!task) {
            return res.status(404).send({ message: 'Task not found or not authorized to delete this task' });
        }
        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        return res.status(500).send({ message: 'Error deleting task' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
