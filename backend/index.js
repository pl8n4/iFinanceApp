const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Basic route to test server
app.get('/', (req, res) => {
    res.send('iFinance backend is up and running!');
  });
  
  // Server listen
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });