const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware');
const sequelize = require('./db');

const BaseUser = require('./models/BaseUser');
const UserPassword = require('./models/UserPassword');
const Administrator = require('./models/Administrator');
const NonAdminUser = require('./models/NonAdminUser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/auth/login', authController.login);
app.post('/api/auth/change-password', authMiddleware.verifyToken, authController.changePassword);

// Admin creates users (admin or non-admin)
app.post('/api/users', async (req, res) => {
  const { name, username, password, role, email, address } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const existing = await UserPassword.findOne({ where: { userName: username } });
    if (existing) return res.status(409).json({ message: 'Username already exists' });

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await BaseUser.create({ id, name });
    await UserPassword.create({ id, userName: username, encryptedPassword: passwordHash });

    if (role === 'admin') {
      await Administrator.create({ id, dateHired: new Date() });
    } else {
      await NonAdminUser.create({ id, email: email || '', address: address || '' });
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Create default admin
async function createDefaultAdmin() {
  const existing = await UserPassword.findOne({ where: { userName: 'admin' } });
  if (existing) return;

  const id = uuidv4();
  const passwordHash = await bcrypt.hash('1111', 10);

  await BaseUser.create({ id, name: 'Admin User' });
  await UserPassword.create({ id, userName: 'admin', encryptedPassword: passwordHash });
  await Administrator.create({ id, dateHired: new Date() });

  console.log('Default admin user created: admin / 1111');
}

sequelize.sync().then(() => {
  createDefaultAdmin();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
