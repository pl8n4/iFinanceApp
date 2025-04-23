// models
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
const NonAdminUserRouter = require('./routes/nonAdminUser');
const authRouter = require('./routes/auth');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Basic route to test server
app.get('/', (req, res) => {
    res.send('iFinance backend is up and running!');
});

// Sets up the port and starts the server
// Establishes connection to the database
const PORT = process.env.PORT || 3000;
async function start() {
  try{
    await sequelize.authenticate()
    console.log('db connected')
    
    // Syncs all the models from ./models to the database. 
    // If the models from the db dont match the ones in ./models, it will alter the db to match the models. 
    await sequelize.sync({alter: true})
    console.log('models synced')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
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
app.use('/api/transaction-lines', transactionLineRouter);
app.use('/api/non-admin-users', NonAdminUserRouter);
app.use('/api/auth', authRouter)

start()