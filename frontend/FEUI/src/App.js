import React, { useState, useEffect } from 'react';
import './App.css';

const initializeUsers = () => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (!users.some(user => user.role === 'admin')) {
    users.push({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
  return users;
};

function App() {
  const [users, setUsers] = useState(initializeUsers());
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [backendUsers, setBackendUsers] = useState([]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetch('http://localhost:3001/api/users')
        .then(res => res.json())
        .then(data => setBackendUsers(data))
        .catch(err => console.error('Error fetching backend users:', err));
    }
  }, [currentUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (users.some((u) => u.username === newUsername)) {
      setError('Username already exists');
      return;
    }
    const newUser = {
      username: newUsername,
      password: newPassword,
      role: newRole
    };
    setUsers([...users, newUser]);
    setError('');
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
  };

  const handleDeleteUser = (username) => {
    if (username === currentUser.username) {
      setError('Cannot delete the current user');
      return;
    }
    setUsers(users.filter((u) => u.username !== username));
  };

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>iFinanceApp Login</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser.username} ({currentUser.role})</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {currentUser.role === 'admin' && (
        <>
          <div className="admin-section">
            <h2>Create New User</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="newUsername">Username</label>
                <input
                  type="text"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newRole">Role</label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit">Create User</button>
            </form>
          </div>

          <div className="admin-section">
            <h2>Local Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.username !== currentUser.username && (
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-section">
            <h2>Backend Users</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {backendUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {currentUser.role === 'user' && (
        <div className="user-section">
          <h2>User Dashboard</h2>
          <p>Welcome to iFinanceApp! This is your user dashboard.</p>
        </div>
      )}
    </div>
  );
}

export default App;