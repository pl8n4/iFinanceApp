const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'Group4_iFINANCEDB'
});

db.connect(err => {
  if (err) console.error(err);
  else console.log('Connected to MySQL');
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      res.json(results[0]); // Return user info
    }
  );
});

// Get all users
app.get('/api/users', (req, res) => {
  db.query('SELECT id, username, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Change password
app.put('/api/users/password', (req, res) => {
  const { username, newPassword } = req.body;
  db.query(
    'UPDATE users SET password = ? WHERE username = ?',
    [newPassword, username],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Password updated' });
    }
  );
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
