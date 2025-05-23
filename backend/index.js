const BaseUser = require('./models/BaseUser');
const UserPassword = require('./models/UserPassword');
const Administrator = require('./models/Administrator');
const NonAdminUser = require('./models/NonAdminUser');
const AccountCategory = require('./models/AccountCategory');
const Group = require('./models/Group');
const MasterAccount = require('./models/MasterAccount');
const Transaction = require('./models/Transaction');
const TransactionLine = require('./models/TransactionLine');

const categoryRouter = require('./routes/accountCategory');
const groupRouter = require('./routes/groups');
const masterAccountRouter = require('./routes/masterAccount');
const transactionRouter = require('./routes/transaction');
const transactionLineRouter = require('./routes/transactionLine');
const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const reportRouter = require('./routes/report'); // Add this line to require the report route

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
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
app.use('/api', reportRouter); // Add this line to mount the report route

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

start();