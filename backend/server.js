const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());
app.use(cors());

let users = [
  {
    id: 1,
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 8) // Pre-hashed password for the test user
  }
];

// Signup Route
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    return res.status(400).send('User already exists');
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = { id: users.length + 1, email, password: hashedPassword };

  users.push(newUser);
  const token = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: '1h' });

  res.status(201).send({ token });
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Received email:', email);
  console.log('Received password:', password);
  
  const user = users.find(u => u.email === email);

  if (!user) {
    console.log('User not found');
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  const passwordIsValid = bcrypt.compareSync(password, user.password);
  console.log('Password is valid:', passwordIsValid);

  if (!passwordIsValid) {
    console.log('Invalid password');
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).send({ token });
  
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});