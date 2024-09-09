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
app.use(cors());

let users = [];


mongoose.connect('mongodb://127.0.0.1:27017/tasknest', {
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.log('MongoDB connection error:', err);
});
  
// Signup Route
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    return res.status(400).send('User already exists');
  }

  if(!password) {
    return res.status(400).send('Password is required');
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = { id: users.length + 1, email, password: hashedPassword };

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

app.post('/api/tasks', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send({ message: 'Token missing' });
  
    const token = authHeader.split(' ')[1]; 
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.id;
      const { description, isImportant, isCompleted } = req.body;
  
      // Debug: Check if we are getting correct data
      console.log('UserId:', userId);
      console.log('Task data:', description, isImportant, isCompleted);
  
      const newTask = new Task({ 
        description, 
        isImportant, 
        isCompleted, 
        userId 
      });
  
      // Use async/await to save the task
      const savedTask = await newTask.save();
      console.log('Task saved successfully:', savedTask); // Debug: Check if the task is being saved
      res.status(201).send(savedTask);
    } catch (err) {
      console.error(err); // Log any error
      return res.status(500).send({ message: 'Error saving task' });
    }
});  
  

// Get Tasks for the User
// Get Tasks for the User
app.get('/api/tasks', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send({ message: 'Token missing' });

    const token = authHeader.split(' ')[1];  
    console.log(token);
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Decoded Token:', decoded);
        const userId = decoded.id; 

        // Use async/await for fetching tasks
        const tasks = await Task.find({ userId });
        res.status(200).send(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err); // Log the actual error
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).send({ message: 'Invalid token' });
        }
        return res.status(500).send({ message: 'Error fetching tasks' });
    }
});


app.delete('/api/tasks/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send({ message: 'Token missing' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.id;
        const taskId = req.params.id;
        const task = await Task.findOneAndDelete({ _id: taskId, userId });

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
