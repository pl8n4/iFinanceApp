require('./models/BaseUser');
require('./models/UserPassword');
require('./models/Administrator');
require('./models/NonAdminUser');
require('./models/AccountCategory');
require('./models/Group');
require('./models/MasterAccount');
require('./models/Transaction');
require('./models/TransactionLine');


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


  

  const PORT = process.env.PORT || 3000;
async function start() {
  try{
    await sequelize.authenticate()
    console.log('db connected')
    
    // Syncs all the models from ./models to the database
    await sequelize.sync({alter: true})
    console.log('models synced')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

start()