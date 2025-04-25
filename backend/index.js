// Models
require('./models/BaseUser');
require('./models/UserPassword');
require('./models/Administrator');
require('./models/NonAdminUser');
require('./models/AccountCategory');
require('./models/Group');
require('./models/MasterAccount');
require('./models/Transaction');
require('./models/TransactionLine');

const categoryRouter = require('./routes/accountCategory');
const groupRouter = require('./routes/groups');
const masterAccountRouter = require('./routes/masterAccount');
const transactionRouter = require('./routes/transaction');
const transactionLineRouter = require('./routes/transactionLine');
const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Restrict to frontend origin
  credentials: true
}));
app.use(express.json());

// Basic route to test server
app.get('/', (req, res) => {
  res.send('iFinance backend is up and running!');
});

// Routes
app.use('/api/categories', categoryRouter);
app.use('/api/groups', groupRouter);
app.use('/api/master-accounts', masterAccountRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/transaction-lines', transactionLineRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Sets up the port and starts the server
const PORT = process.env.PORT || 5001;
async function start() {
  try {
    await sequelize.authenticate();
    console.log('db connected');
    await sequelize.sync({ alter: true });
    console.log('models synced');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// These are all the routes
app.use('/api/categories', categoryRouter);
app.use('/api/groups', groupRouter);
app.use('/api/master-accounts', masterAccountRouter);
app.use('/api/transactions', transactionRouter);
// app.use('/api/transaction-lines', transactionLineRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter)

start();