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
const userRoutes = require('./routes/userRoutes');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/auth/login', authController.login);
app.post('/api/auth/change-password', authMiddleware.verifyToken, authController.changePassword);
app.use('/api/users', userRoutes);

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
